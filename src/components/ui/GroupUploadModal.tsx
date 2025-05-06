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

const tabs = [
  { key: 'file', label: 'Carga desde Archivo', icon: Upload },
  { key: 'manual', label: 'Carga Manual', icon: FileEdit },
] as const;

type ProductCSV = {
  name: string;
  type: string;
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

  useEffect(() => {
    fetch('/api/inventario/nombres')
      .then((res) => res.json())
      .then((data: ProductOption[]) => setProducts(data || []))
      .catch((err) => console.error('Error cargando productos', err));
  }, []);

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
          alert('Error leyendo el archivo');
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
          alert('No hay datos válidos en el archivo');
          return;
        }
        payload = parsedData;
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
              ...item,
              type: match?.type || '',
              unit: match?.unit || '',
            };
          });

        if (valid.length === 0) {
          alert('Debes agregar al menos un producto válido');
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

      onSuccess();
      onClose();
    } catch (error) {
      alert('Error al subir productos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className='relative z-50'>
        <TransitionChild
          as={Fragment}
          enter='ease-out duration-200'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-150'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black/30' />
        </TransitionChild>

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
            <DialogPanel className='w-full max-w-3xl rounded bg-white p-4 sm:p-6 shadow-xl overflow-y-auto max-h-[90vh]'>
              <DialogTitle className='text-lg font-bold mb-4'>
                Cargue Grupal de Productos
              </DialogTitle>

              <div className='flex flex-col sm:flex-row flex-wrap gap-2 mb-4'>
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium border transition w-full sm:w-auto justify-center ${
                      activeTab === tab.key
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
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

              <div className='flex flex-col sm:flex-row justify-end gap-2 mt-6'>
                <button
                  onClick={onClose}
                  className='text-sm px-4 py-2 disabled:opacity-50 border border-gray-300 rounded'
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className='bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition disabled:opacity-50'
                >
                  {loading ? 'Subiendo...' : 'Subir'}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
