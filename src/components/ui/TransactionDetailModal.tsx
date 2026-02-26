'use client';

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { TransactionType } from '@prisma/client';
import { Fragment, useEffect, useState } from 'react';

type DetailItem = {
  name: string;
  type: string;
  unit: string;
  quantity: number;
  price?: number;
  total?: number;
  code?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  transactionId: string;
  isGrouped?: boolean;
};

export default function TransactionDetailModal({
  open,
  onClose,
  transactionId,
  isGrouped = false,
}: Props) {
  const [items, setItems] = useState<DetailItem[]>([]);
  const [user, setUser] = useState('');
  const [date, setDate] = useState('');
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<string>('');

  useEffect(() => {
    if (!open) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/historial/${isGrouped ? 'grupo' : 'detalle'}/${transactionId}`,
        );
        const json = await res.json();

        const data = json.data || {};
        setItems(data.productos || [data.item]);
        setUser(data.user || 'Sistema');
        setDate(new Date(data.createdAt).toLocaleString());
        setTotal(data.totalGeneral ?? null);
        setType(data.type || '');
      } catch (err) {
        console.error('Error cargando detalle de transacción:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [transactionId, open, isGrouped]);

  const shouldShowPrice =
    type === TransactionType.VENTA_INDIVIDUAL ||
    type === TransactionType.VENTA_GRUPAL;

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
            <DialogPanel className='w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl'>
              <DialogTitle className='text-lg font-semibold mb-4'>
                Detalle de Transacción
              </DialogTitle>

              {loading ? (
                <p className='text-sm text-gray-500'>Cargando...</p>
              ) : (
                <div className='space-y-4'>
                  <div className='text-sm'>
                    <p>
                      <strong>Usuario:</strong> {user}
                    </p>
                    <p>
                      <strong>Fecha:</strong> {date}
                    </p>
                  </div>

                  <div className='space-y-3'>
                    {items.map((item, i) => (
                      <div
                        key={i}
                        className='border rounded-md p-4 text-sm bg-gray-50'
                      >
                        <p>
                          <strong>{item.name}</strong> ({item.type}
                          {item.code ? ` - ${item.code}` : ''} - {item.unit})
                        </p>
                        <p>Cantidad: {item.quantity}</p>

                        {shouldShowPrice && item.price !== undefined && (
                          <>
                            <p>
                              Precio unitario: ${item.price.toLocaleString()}
                            </p>
                            <p>
                              Total: $
                              {item.total?.toLocaleString() ??
                                (item.quantity * item.price).toLocaleString()}
                            </p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {shouldShowPrice && total !== null && (
                    <p className='text-right text-sm font-medium'>
                      Total General:{' '}
                      <span className='text-blue-600 font-bold'>
                        ${total.toLocaleString()}
                      </span>
                    </p>
                  )}
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
