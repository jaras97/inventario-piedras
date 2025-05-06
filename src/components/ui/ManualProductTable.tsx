'use client';

import React from 'react';
import { Plus, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ComboBoxInput from '@/components/ui/ComboBoxInput';

export type ManualProduct = {
  name: string;
  type: string;
  unit: string;
  quantity: number;
};

export type ProductOption = {
  name: string;
  type: string;
  unit: string;
};

type Props = {
  value: ManualProduct[];
  onChange: (updated: ManualProduct[]) => void;
  products: ProductOption[];
};

export default function ManualProductTable({
  value,
  onChange,
  products,
}: Props) {
  const handleChange = (
    index: number,
    field: keyof ManualProduct,
    val: string,
  ) => {
    const updated = [...value];
    if (field === 'quantity') {
      updated[index][field] = Number(val);
    } else if (field === 'name') {
      updated[index][field] = val;
      const match = products.find((p) => p.name === val);
      if (match) {
        updated[index].type = match.type;
        updated[index].unit = match.unit;
      }
    } else {
      updated[index][field] = val;
    }
    onChange(updated);
  };

  const handleAddRow = () => {
    onChange([...value, { name: '', type: '', unit: '', quantity: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    const updated = [...value];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className='space-y-4'>
      {/* Encabezados en grande */}
      <div className='hidden lg:grid grid-cols-5 gap-2 font-medium text-sm text-gray-600'>
        <span>Nombre</span>
        <span>Tipo</span>
        <span>Unidad</span>
        <span>Cantidad</span>
        <span>Acción</span>
      </div>

      {value.map((product, index) => (
        <div
          key={index}
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 items-center border rounded p-3'
        >
          <ComboBoxInput
            options={products.map((p) => p.name)}
            value={product.name}
            onChange={(val) => handleChange(index, 'name', val)}
          />
          <span className='text-sm text-gray-700 lg:block hidden'>
            {product.type}
          </span>
          <span className='text-sm text-gray-700 lg:block hidden'>
            {product.unit}
          </span>
          <Input
            type='number'
            value={product.quantity}
            onChange={(e) => handleChange(index, 'quantity', e.target.value)}
          />
          <div className='flex justify-start lg:justify-center'>
            <button
              className='text-red-600 hover:text-red-800 p-1'
              onClick={() => handleRemoveRow(index)}
            >
              <Trash className='w-4 h-4' />
            </button>
          </div>

          {/* Mostrar tipo y unidad debajo del nombre en móviles */}
          <div className='sm:hidden col-span-1 flex flex-col text-xs text-gray-500 mt-1'>
            <span>Tipo: {product.type}</span>
            <span>Unidad: {product.unit}</span>
          </div>
        </div>
      ))}

      <Button
        onClick={handleAddRow}
        variant='outline'
        className='flex items-center gap-2 text-sm'
      >
        <Plus className='w-4 h-4' /> Agregar fila
      </Button>
    </div>
  );
}
