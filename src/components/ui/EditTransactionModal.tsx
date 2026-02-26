'use client';

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { Edit3 } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  transactionId: string;
};

export default function EditTransactionModal({
  open,
  onClose,
  transactionId,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState('');
  const [productCode, setProductCode] = useState<string | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [user, setUser] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (!open) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/historial/detalle/${transactionId}`);
        const json = await res.json();
        const data = json.data;

        const item = data.productos?.[0];
        setProductName(item?.name ?? '—');
        setProductCode(item?.code ?? null);
        setPrice(item?.price ?? null);
        setUser(data.user ?? 'Sistema');
        setDate(new Date(data.createdAt).toLocaleString());
      } catch (err) {
        console.error('Error al cargar detalle de edición:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [open, transactionId]);

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={onClose}>
        <div className='fixed inset-0 bg-black/30 backdrop-blur-sm' />

        <div className='fixed inset-0 flex items-center justify-center p-4'>
          <TransitionChild
            as={Fragment}
            enter='ease-out duration-200'
            enterFrom='opacity-0 scale-95'
            enterTo='opacity-100 scale-100'
            leave='ease-in duration-150'
            leaveFrom='opacity-100 scale-100'
            leaveTo='opacity-0 scale-95'
          >
            <DialogPanel className='w-full max-w-md rounded-lg bg-white p-6 shadow-xl'>
              <DialogTitle className='text-lg font-semibold mb-4 flex items-center gap-2'>
                <Edit3 className='w-5 h-5 text-yellow-600' />
                Edición de Producto
              </DialogTitle>

              {loading ? (
                <p className='text-sm text-gray-500'>Cargando...</p>
              ) : (
                <div className='space-y-2 text-sm'>
                  <p>
                    <strong>Producto editado:</strong> {productName}
                    {productCode ? ` (${productCode})` : ''}
                  </p>
                  <p>
                    <strong>Nuevo precio:</strong>{' '}
                    {price != null ? `$${price.toLocaleString()}` : '—'}
                  </p>
                  <p>
                    <strong>Modificado por:</strong> {user}
                  </p>
                  <p>
                    <strong>Fecha:</strong> {date}
                  </p>
                </div>
              )}

              <div className='flex justify-end mt-6'>
                <button
                  onClick={onClose}
                  className='text-sm px-4 py-2 border rounded hover:bg-gray-100 transition'
                >
                  Cerrar
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
