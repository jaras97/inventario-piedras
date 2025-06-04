'use client';

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { Fragment, useMemo, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import NumericInput from '@/components/components/NumericInput';
import { InventoryItem } from '@/types/inventory';
import { useMessageStore } from '@/store/messageStore';

type LoadForm = {
  amount: number;
};

type Props = {
  item: InventoryItem;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function LoadModal({ item, open, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const { setMessage } = useMessageStore();

  const schema = useMemo(() => {
    return z.object({
      amount:
        item.unit.valueType === 'INTEGER'
          ? z
              .number({ invalid_type_error: 'Debe ser un número' })
              .int()
              .positive('Debe ser mayor a cero')
          : z
              .number({ invalid_type_error: 'Debe ser un número' })
              .positive('Debe ser mayor a cero'),
    });
  }, [item.unit.valueType]);

  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<LoadForm>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0 },
  });

  const onSubmit = async (data: LoadForm) => {
    setLoading(true);
    const res = await fetch(`/api/inventario/${item.id}/entrada`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });

    setLoading(false);
    if (res.ok) {
      setMessage('success', 'Inventario cargado exitosamente');
      reset();
      onSuccess();
      onClose();
    } else {
      const err = await res.json();
      setMessage('error', err?.error || 'Error al cargar inventario');
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
                Cargar inventario
              </DialogTitle>

              <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <NumericInput
                  label={`Cantidad a cargar (${item.unit.name})`}
                  value={watch('amount')}
                  onChange={(val) => setValue('amount', val)}
                  error={errors.amount?.message}
                  allowDecimal={item.unit.valueType === 'DECIMAL'}
                />

                <div className='flex justify-end gap-2 pt-4'>
                  <Button
                    variant='outline'
                    type='button'
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button type='submit' disabled={loading}>
                    {loading ? 'Cargando...' : 'Confirmar'}
                  </Button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
