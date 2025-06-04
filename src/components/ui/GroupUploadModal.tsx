'use client';

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { Upload, FileEdit } from 'lucide-react';
import Papa, { ParseResult } from 'papaparse';
import ManualProductTable, {
  ManualProduct,
  ProductOption,
} from '@/components/ui/ManualProductTable';
import { Button } from '@/components/ui/button';
import { useMessageStore } from '@/store/messageStore';

const tabs = [
  { key: 'file', label: 'Carga desde Archivo', icon: Upload },
  { key: 'manual', label: 'Carga Manual', icon: FileEdit },
] as const;

type ProductCSV = {
  name: string;
  category: string;
  unit: string;
  quantity: string | number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function GroupUploadModal({ open, onClose, onSuccess }: Props) {
  const [activeTab, setActiveTab] = useState<'file' | 'manual'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ProductCSV[]>([]);
  const [manualProducts, setManualProducts] = useState<ManualProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);

  const { setMessage } = useMessageStore();

  useEffect(() => {
    if (!open) return;

    const fetchProducts = async () => {
      const res = await fetch('/api/inventario/nombres');
      const data: ProductOption[] = await res.json();
      setProducts(data || []);
    };

    fetchProducts();
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      Papa.parse<ProductCSV>(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results: ParseResult<ProductCSV>) => {
          setParsedData(results.data);
        },
        error: (error: Error) => {
          setMessage('error', 'Error leyendo el archivo');
          console.error(error);
        },
      });
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);

    try {
      let payload: ProductCSV[] = [];

      if (activeTab === 'file') {
        if (parsedData.length === 0) {
          setMessage('error', 'No hay datos válidos en el archivo');
          return;
        }

        payload = parsedData.map((item) => ({
          ...item,
          quantity: Number(item.quantity),
        }));
      } else {
        const valid = manualProducts
          .filter(
            (item) =>
              item.name.trim() !== '' &&
              !isNaN(Number(item.quantity)) &&
              Number(item.quantity) > 0,
          )
          .map((item) => {
            const match = products.find((p) => p.name === item.name);
            return {
              name: item.name,
              category: match?.category || '',
              unit: match?.unit || '',
              quantity: item.quantity,
            };
          });

        if (valid.length === 0) {
          setMessage('error', 'Debes agregar al menos un producto válido');
          return;
        }

        payload = valid;
      }

      const res = await fetch('/api/inventario/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Error al enviar los datos');
      setMessage('success', 'Productos cargados correctamente');
      onSuccess();
      onClose();
    } catch (error) {
      setMessage('error', 'Error al subir productos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={onClose}>
        <div className='fixed inset-0 bg-black/30 backdrop-blur-sm' />
        <div className='fixed inset-0 flex items-center justify-center p-2 sm:p-4'>
          <TransitionChild
            as={Fragment}
            enter='ease-out duration-200'
            enterFrom='opacity-0 scale-95'
            enterTo='opacity-100 scale-100'
            leave='ease-in duration-150'
            leaveFrom='opacity-100 scale-100'
            leaveTo='opacity-0 scale-95'
          >
            <DialogPanel className='w-full max-w-3xl rounded bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto'>
              <DialogTitle className='text-lg font-semibold mb-4'>
                Cargue Grupal de Productos
              </DialogTitle>

              <div className='flex flex-col sm:flex-row gap-2 mb-6'>
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium border transition w-full sm:w-auto justify-center ${
                      activeTab === tab.key
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className='w-4 h-4' /> {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'file' && (
                <div className='space-y-4'>
                  <input
                    type='file'
                    accept='.csv'
                    onChange={handleFileChange}
                    className='border rounded px-3 py-2 w-full text-sm'
                  />
                  {file && (
                    <p className='text-sm text-gray-600'>
                      Archivo seleccionado: {file.name}
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'manual' && (
                <ManualProductTable
                  value={manualProducts}
                  onChange={setManualProducts}
                  products={products}
                />
              )}

              <div className='flex justify-end gap-2 mt-6'>
                <Button variant='outline' onClick={onClose} disabled={loading}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Subiendo...' : 'Subir'}
                </Button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
