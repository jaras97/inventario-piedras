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
import { useMessageStore } from '@/store/messageStore';

type Option = {
  id: string;
  name?: string;
  code?: string;
  valueType?: 'INTEGER' | 'DECIMAL';
};

type FormData = {
  name: string;
  categoryId: string;
  unitId: string;
  subcategoryCodeId?: string;
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
  const [categories, setCategories] = useState<Option[]>([]);
  const [units, setUnits] = useState<Option[]>([]);
  const [codes, setCodes] = useState<Option[]>([]);
  const [unitType, setUnitType] = useState<'INTEGER' | 'DECIMAL'>('DECIMAL');
  const [loading, setLoading] = useState(false);

  const { setMessage } = useMessageStore();

  const schema = useMemo(() => {
    return z.object({
      name: z.string().min(1, 'El nombre es obligatorio'),
      categoryId: z.string().min(1, 'Seleccione una categoría'),
      unitId: z.string().min(1, 'Seleccione una unidad'),
      subcategoryCodeId:
        codes.length > 0
          ? z.string().min(1, 'Debe seleccionar un código')
          : z.string().optional(),
      quantity:
        unitType === 'INTEGER'
          ? z
              .number({ invalid_type_error: 'Debe ser un número' })
              .int()
              .positive('Debe ser mayor a 0')
          : z
              .number({ invalid_type_error: 'Debe ser un número' })
              .positive('Debe ser mayor a 0'),
      price: z
        .number({ invalid_type_error: 'Debe ser un número' })
        .positive('Debe ser mayor a 0'),
    });
  }, [unitType, codes]);

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
      categoryId: '',
      unitId: '',
      subcategoryCodeId: '',
      quantity: 0,
      price: 0,
    },
  });

  const categoryId = watch('categoryId');
  const unitId = watch('unitId');

  const disableFields = !unitId;

  useEffect(() => {
    if (!open) return;
    const fetchMetadata = async () => {
      const res = await fetch('/api/inventario/metadata');
      const json = await res.json();
      setCategories(json.categories || []);
      setUnits(json.units || []);
    };
    fetchMetadata();
  }, [open]);

  useEffect(() => {
    const selected = units.find((u) => u.id === unitId);
    setUnitType(selected?.valueType === 'INTEGER' ? 'INTEGER' : 'DECIMAL');
    setValue('quantity', 0);
    setValue('price', 0);
  }, [unitId, units, setValue]);

  useEffect(() => {
    const fetchCodes = async () => {
      if (!categoryId) return;
      const res = await fetch(`/api/codigos?categoryId=${categoryId}`);
      const json = await res.json();
      setCodes(json || []);
    };
    fetchCodes();
  }, [categoryId]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const res = await fetch('/api/inventario/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (res.ok) {
      setMessage('success', 'Producto creado exitosamente');
      reset();
      onSuccess();
      onClose();
    } else {
      const err = await res.json();
      setMessage('error', err?.error || 'Error al crear producto');
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
                  placeholder='Ej: Esmeralda'
                  {...register('name')}
                  error={errors.name?.message}
                />

                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Categoría
                  </label>
                  <select
                    className='w-full border rounded px-3 py-2 text-sm'
                    {...register('categoryId')}
                  >
                    <option value=''>Seleccione categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className='text-sm text-red-500 mt-1'>
                      {errors.categoryId.message}
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

                {codes.length > 0 && (
                  <div>
                    <label className='block text-sm font-medium mb-1'>
                      Código
                    </label>
                    <select
                      className='w-full border rounded px-3 py-2 text-sm'
                      {...register('subcategoryCodeId')}
                      disabled={codes.length === 0}
                    >
                      <option value=''>Seleccione un código</option>
                      {codes.map((code) => (
                        <option key={code.id} value={code.id}>
                          {code.name || code.code}
                        </option>
                      ))}
                    </select>
                    {errors.subcategoryCodeId && (
                      <p className='text-sm text-red-500 mt-1'>
                        {errors.subcategoryCodeId.message}
                      </p>
                    )}
                  </div>
                )}

                <NumericInput
                  label='Cantidad inicial'
                  value={watch('quantity')}
                  onChange={(val) => setValue('quantity', val)}
                  error={errors.quantity?.message}
                  allowDecimal={unitType !== 'INTEGER'}
                  disabled={disableFields}
                />

                <NumericInput
                  label='Precio por unidad'
                  value={watch('price')}
                  onChange={(val) => setValue('price', val)}
                  error={errors.price?.message}
                  allowDecimal={true}
                  disabled={disableFields}
                />

                <div className='flex justify-end gap-2 pt-4'>
                  <Button variant='outline' onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button type='submit' disabled={loading}>
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
