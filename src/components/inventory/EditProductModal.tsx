'use client';

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { LabeledInput } from '@/components/ui/LabeledInput';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/button';
import NumericInput from '@/components/components/NumericInput';

interface SelectOption {
  label: string;
  value: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: {
    id: string;
    name: string;
    typeId: string;
    price: number;
  } | null;
  types: { id: string; name: string }[];
}

export default function EditProductModal({
  open,
  onClose,
  onSuccess,
  product,
  types,
}: Props) {
  const [form, setForm] = useState<{
    name: string;
    type: SelectOption | null;
    price: number;
  }>({
    name: '',
    type: null,
    price: 0,
  });

  const [loading, setLoading] = useState(false);

  const typeOptions = useMemo(
    () => types.map((t) => ({ label: t.name, value: t.id })),
    [types],
  );

  useEffect(() => {
    if (!open || !product) return;
    const selectedType =
      typeOptions.find((opt) => opt.value === product.typeId) || null;

    setForm({
      name: product.name,
      type: selectedType,
      price: product.price,
    });
  }, [open, product, typeOptions]);

  const handleSubmit = async () => {
    if (!product || !form.type) return;
    setLoading(true);
    const res = await fetch(`/api/inventario/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        typeId: form.type.value,
        price: form.price,
      }),
    });

    setLoading(false);
    if (res.ok) {
      onSuccess();
      onClose();
    } else {
      alert('Error al actualizar producto');
    }
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className='relative z-50'>
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
              <DialogTitle className='text-lg font-bold mb-4'>
                Editar Producto
              </DialogTitle>

              <div className='space-y-4'>
                <LabeledInput
                  label='Nombre'
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <Select
                  label='Tipo'
                  options={typeOptions}
                  value={form.type}
                  onChange={(opt) => setForm({ ...form, type: opt })}
                />

                <NumericInput
                  label='Precio'
                  value={form.price}
                  onChange={(val) => setForm({ ...form, price: val })}
                  allowDecimal={true}
                />
              </div>

              <div className='flex justify-end gap-2 mt-6'>
                <Button variant='outline' onClick={onClose} disabled={loading}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
