'use client';

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import NumericInput from '../components/NumericInput';

type SellForm = {
  amount: number;
  price: number;
};

type Props = {
  itemId: string;
  unitId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function SellModal({
  itemId,
  unitId,
  open,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [unitType, setUnitType] = useState<'INTEGER' | 'DECIMAL'>('DECIMAL');

  useEffect(() => {
    if (!open) return;
    const fetchUnitType = async () => {
      try {
        const res = await fetch(`/api/unidades/${unitId}`);
        const json = await res.json();
        setUnitType(json.valueType || 'DECIMAL');
      } catch (error) {
        console.error('Error obteniendo unidad', error);
      }
    };
    fetchUnitType();
  }, [open, unitId]);

  const schema = useMemo(() => {
    const base = {
      amount: z
        .number({ invalid_type_error: 'Debe ser un número' })
        .positive('Debe ser mayor a cero'),
      price: z
        .number({ invalid_type_error: 'Debe ser un número' })
        .positive('Debe ser mayor a cero'),
    };

    return z.object({
      amount:
        unitType === 'INTEGER'
          ? base.amount.refine(Number.isInteger, {
              message: 'Debe ser un número entero',
            })
          : base.amount,
      price: base.price,
    });
  }, [unitType]);

  const {
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<SellForm>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0, price: 0 },
  });

  const onSubmit = async (data: SellForm) => {
    setLoading(true);
    const res = await fetch(`/api/inventario/${itemId}/salida`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    setLoading(false);
    if (res.ok) {
      reset();
      onSuccess();
      onClose();
    } else {
      alert('Error al vender inventario');
    }
  };

  const amount = watch('amount') || 0;
  const price = watch('price') || 0;
  const total = amount * price;

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
                Vender inventario
              </DialogTitle>

              <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <NumericInput
                  label='Cantidad'
                  error={errors.amount?.message}
                  value={amount}
                  onChange={(val) => setValue('amount', val)}
                  allowDecimal={unitType !== 'INTEGER'}
                />

                <NumericInput
                  label='Precio por unidad'
                  error={errors.price?.message}
                  value={price}
                  onChange={(val) => setValue('price', val)}
                  allowDecimal={true}
                />

                <p className='text-sm font-medium text-gray-700 mt-2'>
                  Total:{' '}
                  <span className='font-bold text-blue-600'>
                    ${total.toLocaleString()}
                  </span>
                </p>

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
                    {loading ? 'Vendiendo...' : 'Confirmar'}
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
