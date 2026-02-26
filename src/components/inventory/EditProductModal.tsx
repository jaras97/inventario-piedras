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
import { useMessageStore } from '@/store/messageStore';

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
    categoryId: string;
    subcategoryCode?: {
      id: string;
      code: string;
      name?: string | null;
    } | null;
    price: number;
  } | null;
  types: { id: string; name: string }[];
}

type SubcategoryCode = {
  id: string;
  code: string;
  name?: string | null;
};

export default function EditProductModal({
  open,
  onClose,
  onSuccess,
  product,
  types,
}: Props) {
  const [form, setForm] = useState<{
    name: string;
    category: SelectOption | null;
    price: number;
    code: SelectOption | null;
  }>({
    name: '',
    category: null,
    price: 0,
    code: null,
  });

  const [codes, setCodes] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setMessage } = useMessageStore();

  const categoryOptions = useMemo(
    () => types.map((t) => ({ label: t.name, value: t.id })),
    [types],
  );

  useEffect(() => {
    if (!open || !product) return;

    const selectedCategory =
      categoryOptions.find((opt) => opt.value === product.categoryId) || null;

    const fetchCodes = async () => {
      if (!selectedCategory) return;
      const res = await fetch(
        `/api/codigos?categoryId=${selectedCategory.value}`,
      );
      const json = (await res.json()) as SubcategoryCode[];
      const options: SelectOption[] = json.map((code) => ({
        label: code.name || code.code,
        value: code.id,
      }));

      setCodes(options);

      const selectedCode =
        options.find((opt) => opt.value === product.subcategoryCode?.id) ||
        null;

      setForm({
        name: product.name,
        category: selectedCategory,
        price: product.price,
        code: selectedCode,
      });
    };

    fetchCodes();
  }, [open, product, categoryOptions]);

  const handleCategoryChange = async (opt: SelectOption | null) => {
    setForm({ ...form, category: opt, code: null });

    if (!opt) {
      setCodes([]);
      return;
    }

    const res = await fetch(`/api/codigos?categoryId=${opt.value}`);
    const json = (await res.json()) as SubcategoryCode[];
    const options: SelectOption[] = json.map((code) => ({
      label: code.name || code.code,
      value: code.id,
    }));

    setCodes(options);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!product || !form.category) return;

    if (codes.length > 0 && !form.code) {
      setError('Debe seleccionar un código');
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/inventario/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        categoryId: form.category.value,
        price: form.price,
        subcategoryCodeId: form.code?.value || null,
      }),
    });

    setLoading(false);
    if (res.ok) {
      setMessage('success', 'Producto actualizado correctamente');
      onSuccess();
      onClose();
    } else {
      setMessage('error', 'Error al actualizar producto');
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
                  label='Categoría'
                  options={categoryOptions}
                  value={form.category}
                  onChange={handleCategoryChange}
                />

                {codes.length > 0 && (
                  <div>
                    <Select
                      label='Código'
                      options={codes}
                      value={form.code}
                      onChange={(opt) => setForm({ ...form, code: opt })}
                    />
                    {error && (
                      <p className='text-sm text-red-500 mt-1'>{error}</p>
                    )}
                  </div>
                )}

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
