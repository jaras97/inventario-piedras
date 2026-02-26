'use client';

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { Fragment, useState } from 'react';
import { Button } from '@/components/ui/button';

type AdjustModalProps = {
  item: { id: string | number };
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function AdjustModal({
  item,
  open,
  onClose,
  onSuccess,
}: AdjustModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async () => {
    setErrorMessage('');

    if (!amount || !reason) {
      setErrorMessage('Debes completar todos los campos.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/inventario/ajuste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          amount: parseFloat(amount),
          reason,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Error al realizar el ajuste');
      }

      setAmount('');
      setReason('');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : 'Error inesperado';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

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
            <DialogPanel className='w-full max-w-sm rounded bg-white p-6 shadow-xl'>
              <DialogTitle className='text-lg font-bold mb-4'>
                Ajuste de inventario
              </DialogTitle>

              <div className='space-y-4'>
                {/* Cantidad */}
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Cantidad
                  </label>
                  <input
                    type='number'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className='mt-1 w-full border rounded px-3 py-2 text-sm'
                    placeholder='Cantidad a ajustar'
                  />
                </div>

                {/* Motivo */}
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Motivo del ajuste
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className='mt-1 w-full border rounded px-3 py-2 text-sm resize-none'
                    rows={3}
                    placeholder='Explica el motivo del ajuste'
                  />
                </div>

                {/* Error */}
                {errorMessage && (
                  <p className='text-sm text-red-600'>{errorMessage}</p>
                )}

                {/* Botones */}
                <div className='flex justify-end gap-2 pt-4'>
                  <Button
                    variant='outline'
                    type='button'
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>

                  <Button
                    type='button'
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Ajustando...' : 'Confirmar ajuste'}
                  </Button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
