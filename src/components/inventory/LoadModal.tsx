'use client';

import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const schema = z.object({
  amount: z
    .number({ invalid_type_error: 'Debe ser un número' })
    .positive('Debe ser mayor a cero'),
});

type LoadForm = z.infer<typeof schema>;

type Props = {
  itemId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function LoadModal({ itemId, open, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoadForm>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0 },
  });

  const onSubmit = async (data: LoadForm) => {
    setLoading(true);
    const res = await fetch(`/api/inventario/${itemId}/entrada`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    setLoading(false);
    if (res.ok) {
      reset();
      onSuccess();
      onClose();
    } else {
      alert('Error al cargar inventario');
    }
  };

  if (!open) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='bg-white rounded p-6 w-full max-w-sm shadow-md'
      >
        <h2 className='text-lg font-semibold mb-4'>Cargar inventario</h2>

        <label className='block text-sm mb-1'>Cantidad a cargar</label>
        <input
          type='number'
          step='0.01'
          {...register('amount', { valueAsNumber: true })}
          className='w-full border rounded px-3 py-2 mb-2'
        />
        {errors.amount && (
          <p className='text-sm text-red-500 mb-2'>{errors.amount.message}</p>
        )}

        <div className='flex justify-end gap-2 mt-4'>
          <button
            type='button'
            className='text-sm px-3 py-1 border rounded'
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type='submit'
            className='text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700'
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Confirmar'}
          </button>
        </div>
      </form>
    </div>
  );
}
