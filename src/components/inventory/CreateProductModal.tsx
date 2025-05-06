'use client';

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type Option = {
  id: string;
  name: string;
};

export default function CreateProductModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState({
    name: '',
    typeId: '',
    unitId: '',
    quantity: 0,
  });

  const [types, setTypes] = useState<Option[]>([]);
  const [units, setUnits] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      const res = await fetch('/api/inventario/metadata');
      const json = await res.json();
      setTypes(json.types || []);
      setUnits(json.units || []);
    };

    if (open) fetchMetadata();
  }, [open]);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch('/api/inventario/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (res.ok) {
      onSuccess();
      onClose();
    } else {
      alert('Error al crear producto');
    }
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className='relative z-50'>
        <TransitionChild
          as={Fragment}
          enter='ease-out duration-200'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-150'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black/30' />
        </TransitionChild>

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
                Crear Nuevo Producto
              </DialogTitle>

              <div className='space-y-3'>
                <input
                  className='w-full border rounded px-3 py-2 text-sm'
                  placeholder='Nombre'
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <select
                  className='w-full border rounded px-3 py-2 text-sm'
                  value={form.typeId}
                  onChange={(e) => setForm({ ...form, typeId: e.target.value })}
                >
                  <option value=''>Seleccione tipo</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>

                <select
                  className='w-full border rounded px-3 py-2 text-sm'
                  value={form.unitId}
                  onChange={(e) => setForm({ ...form, unitId: e.target.value })}
                >
                  <option value=''>Seleccione unidad</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>

                <input
                  type='number'
                  className='w-full border rounded px-3 py-2 text-sm'
                  placeholder='Cantidad inicial'
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantity: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className='flex justify-end gap-2 mt-6'>
                <button onClick={onClose} className='text-sm px-4 py-2'>
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className='bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition'
                >
                  {loading ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
