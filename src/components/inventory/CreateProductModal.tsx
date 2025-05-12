'use client';

import { useEffect, useMemo, useState, Fragment } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { LabeledInput } from '@/components/ui/LabeledInput';
import NumericInput from '@/components/components/NumericInput';

type Option = {
  id: string;
  name: string;
  valueType?: 'INTEGER' | 'DECIMAL';
};

type FormData = {
  name: string;
  typeId: string;
  unitId: string;
  quantity: number;
  price: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function CreateProductModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [types, setTypes] = useState<Option[]>([]);
  const [units, setUnits] = useState<Option[]>([]);
  const [unitType, setUnitType] = useState<'INTEGER' | 'DECIMAL'>('DECIMAL');
  const [loading, setLoading] = useState(false);

  const schema = useMemo(() => {
    const base = {
      name: z.string().min(1, 'El nombre es obligatorio'),
      typeId: z.string().min(1, 'Seleccione un tipo'),
      unitId: z.string().min(1, 'Seleccione una unidad'),
      quantity:
        unitType === 'INTEGER'
          ? z
              .number({ invalid_type_error: 'Debe ser un número' })
              .int('Debe ser un número entero')
              .nonnegative('No puede ser negativo')
          : z
              .number({ invalid_type_error: 'Debe ser un número' })
              .nonnegative('No puede ser negativo'),
      price: z
        .number({ invalid_type_error: 'Debe ser un número' })
        .nonnegative('No puede ser negativo'),
    };

    return z.object(base);
  }, [unitType]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      typeId: '',
      unitId: '',
      quantity: 0,
      price: 0,
    },
  });

  const name = watch('name');
  const typeId = watch('typeId');
  const unitId = watch('unitId');

  const disableInputs = !name || !typeId || !unitId;

  useEffect(() => {
    if (!open) return;

    const fetchMetadata = async () => {
      const res = await fetch('/api/inventario/metadata');
      const json = await res.json();
      setTypes(json.types || []);
      setUnits(json.units || []);
    };

    fetchMetadata();
  }, [open]);

  useEffect(() => {
    const selected = units.find((u) => u.id === unitId);
    if (selected?.valueType === 'INTEGER') setUnitType('INTEGER');
    else setUnitType('DECIMAL');
    setValue('quantity', 0);
    setValue('price', 0);
  }, [unitId, units, setValue]);

  useEffect(() => {
    setValue('quantity', 0);
    setValue('price', 0);
  }, [name, typeId, setValue]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const res = await fetch('/api/inventario/create', {
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
      alert('Error al crear producto');
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
            <DialogPanel className='w-full max-w-md rounded bg-white p-6 shadow-xl'>
              <DialogTitle className='text-lg font-semibold mb-4'>
                Crear Nuevo Producto
              </DialogTitle>

              <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                <LabeledInput
                  label='Nombre del producto'
                  placeholder='Esmeralda'
                  {...register('name')}
                  error={errors.name?.message}
                />

                <div>
                  <label className='block text-sm font-medium mb-1'>Tipo</label>
                  <select
                    className='w-full border rounded px-3 py-2 text-sm'
                    {...register('typeId')}
                  >
                    <option value=''>Seleccione tipo</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  {errors.typeId && (
                    <p className='text-sm text-red-500 mt-1'>
                      {errors.typeId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Unidad
                  </label>
                  <select
                    className='w-full border rounded px-3 py-2 text-sm'
                    {...register('unitId')}
                  >
                    <option value=''>Seleccione unidad</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  {errors.unitId && (
                    <p className='text-sm text-red-500 mt-1'>
                      {errors.unitId.message}
                    </p>
                  )}
                </div>

                <NumericInput
                  label='Cantidad inicial'
                  value={watch('quantity')}
                  onChange={(val) => setValue('quantity', val)}
                  error={errors.quantity?.message}
                  allowDecimal={unitType !== 'INTEGER'}
                  disabled={disableInputs}
                />

                <NumericInput
                  label='Precio por unidad'
                  value={watch('price')}
                  onChange={(val) => setValue('price', val)}
                  error={errors.price?.message}
                  allowDecimal={true}
                  disabled={disableInputs}
                />

                <div className='flex justify-end gap-2 pt-4'>
                  <Button variant='outline' onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button type='submit' disabled={loading || disableInputs}>
                    {loading ? 'Creando...' : 'Crear'}
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
