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
import { useMessageStore } from '@/store/messageStore';

type SellForm = {
  amount: number;
  price: number;
  paymentMethod:
    | 'EFECTIVO'
    | 'TRANSFERENCIA'
    | 'NEQUI'
    | 'DAVIPLATA'
    | 'TARJETA'
    | 'OTRO';
  clientName?: string;
  notes?: string;
  soldAt?: string;
};

function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

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
  const [errorMessage, setErrorMessage] = useState('');
  const [stock, setStock] = useState<number | null>(null);
  const [adjusted, setAdjusted] = useState(false);

  const { setMessage } = useMessageStore();

  const {
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
    register,
  } = useForm<SellForm>({
    resolver: zodResolver(
      useMemo(() => {
        return z.object({
          amount:
            unitType === 'INTEGER'
              ? z
                  .number()
                  .int('Debe ser un número entero')
                  .positive('Debe ser mayor a cero')
              : z.number().positive('Debe ser mayor a cero'),
          price: z.number().positive('Debe ser mayor a cero'),
          paymentMethod: z.enum([
            'EFECTIVO',
            'TRANSFERENCIA',
            'NEQUI',
            'DAVIPLATA',
            'TARJETA',
            'OTRO',
          ]),
          clientName: z.string().optional(),
          notes: z.string().optional(),
          soldAt: z.string().optional(), // 👈 validamos como string opcional
        });
      }, [unitType]),
    ),
    defaultValues: {
      amount: 0,
      price: 0,
      paymentMethod: 'EFECTIVO',
      clientName: '',
      notes: '',
      soldAt: toLocalInputValue(new Date()), // 👈 por defecto “ahora” en local
    },
  });

  useEffect(() => {
    if (open) setValue('soldAt', toLocalInputValue(new Date()));
  }, [open, setValue]);

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        setErrorMessage('');

        const [unitRes, itemRes] = await Promise.all([
          fetch(`/api/unidades/${unitId}`),
          fetch(`/api/inventario/${itemId}`),
        ]);

        const unitJson = unitRes.ok ? await unitRes.json() : null;
        const itemJson = itemRes.ok ? await itemRes.json() : null;

        if (!unitJson) throw new Error('No se pudo obtener la unidad');
        if (!itemJson) throw new Error('No se pudo obtener el producto');

        setUnitType(unitJson.valueType || 'DECIMAL');
        if (itemJson.price) setValue('price', itemJson.price);
        if (itemJson.quantity !== undefined) setStock(itemJson.quantity);
      } catch (error) {
        console.error('Error obteniendo datos del producto:', error);
        setErrorMessage('Error al cargar información del producto.');
      }
    };

    fetchData();
  }, [open, itemId, unitId, setValue]);

  const onSubmit = async (data: SellForm) => {
    setErrorMessage('');

    if (stock !== null && data.amount > stock) {
      setValue('amount', stock);
      setAdjusted(true);
      return;
    }

    setLoading(true);

    const soldAtUTC = data.soldAt
      ? new Date(data.soldAt).toISOString()
      : undefined;

    const res = await fetch(`/api/inventario/${itemId}/salida`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, soldAt: soldAtUTC }),
    });

    setLoading(false);

    if (res.ok) {
      setMessage('success', 'Venta registrada exitosamente');
      reset();
      onSuccess();
      onClose();
    } else {
      const err = await res.json();

      const errorMsg = err?.error || 'Error al vender inventario';
      setMessage('error', errorMsg);
      setErrorMessage(err?.error || 'Error al vender inventario');
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

                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Método de pago
                  </label>
                  <select
                    {...register('paymentMethod')}
                    className='mt-1 w-full border rounded px-3 py-2 text-sm'
                  >
                    <option value='EFECTIVO'>Efectivo</option>
                    <option value='TRANSFERENCIA'>Transferencia</option>
                    <option value='NEQUI'>Nequi</option>
                    <option value='DAVIPLATA'>Daviplata</option>
                    <option value='TARJETA'>Tarjeta</option>
                    <option value='OTRO'>Otro</option>
                  </select>
                  {errors.paymentMethod && (
                    <p className='text-sm text-red-600 mt-1'>
                      {errors.paymentMethod.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Cliente (opcional)
                  </label>
                  <input
                    type='text'
                    {...register('clientName')}
                    className='mt-1 w-full border rounded px-3 py-2 text-sm'
                    placeholder='Nombre del cliente'
                  />
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Notas (opcional)
                  </label>
                  <textarea
                    {...register('notes')}
                    className='mt-1 w-full border rounded px-3 py-2 text-sm resize-none'
                    rows={3}
                    placeholder='Comentarios o detalles adicionales'
                  />
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Fecha y hora de la venta
                  </label>
                  <input
                    type='datetime-local'
                    {...register('soldAt')}
                    className='mt-1 w-full border rounded px-3 py-2 text-sm'
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    Se almacenará en UTC automáticamente.
                  </p>
                </div>

                <div className='space-y-1'>
                  <p className='text-sm font-medium text-gray-700'>
                    Total:{' '}
                    <span className='font-bold text-blue-600'>
                      ${total.toLocaleString()}
                    </span>
                  </p>

                  {adjusted && (
                    <p className='text-sm text-yellow-600'>
                      La cantidad ingresada excedía el stock. Se ajustó al
                      máximo disponible ({stock}).
                    </p>
                  )}

                  {errorMessage && (
                    <p className='text-sm text-red-600'>{errorMessage}</p>
                  )}
                </div>

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
