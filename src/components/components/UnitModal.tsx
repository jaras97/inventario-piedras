'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  unit?: { id: string; name: string; valueType: 'INTEGER' | 'DECIMAL' };
  onSuccess: () => void;
};

export default function UnitModal({ open, onClose, unit, onSuccess }: Props) {
  const [name, setName] = useState(unit?.name || '');
  const [valueType, setValueType] = useState<'INTEGER' | 'DECIMAL'>(
    unit?.valueType || 'DECIMAL',
  );
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const body = { name, valueType, ...(unit?.id ? { id: unit.id } : {}) };
    const method = unit ? 'PUT' : 'POST';

    const res = await fetch('/api/unidades', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (res.ok) {
      onSuccess();
      onClose();
    } else {
      alert('Error al guardar unidad');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <div className='fixed inset-0 bg-black/30 backdrop-blur-sm' />
      <div className='fixed inset-0 flex items-center justify-center p-4'>
        <DialogPanel className='bg-white p-6 rounded-lg shadow-xl w-full max-w-md'>
          <DialogTitle className='text-lg font-semibold mb-4'>
            {unit ? 'Editar Unidad' : 'Nueva Unidad'}
          </DialogTitle>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium'>Nombre</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full border rounded px-3 py-2 mt-1'
              />
            </div>

            <div>
              <label className='block text-sm font-medium'>Tipo de valor</label>
              <select
                value={valueType}
                onChange={(e) =>
                  setValueType(e.target.value as 'INTEGER' | 'DECIMAL')
                }
                className='w-full border rounded px-3 py-2 mt-1'
              >
                <option value='INTEGER'>Entero</option>
                <option value='DECIMAL'>Decimal</option>
              </select>
            </div>
          </div>

          <div className='flex justify-end gap-2 mt-6'>
            <button
              onClick={onClose}
              className='px-4 py-2 text-sm border rounded hover:bg-gray-100'
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className='px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
              disabled={loading}
            >
              Guardar
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
