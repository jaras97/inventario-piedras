'use client';

import React, { useState } from 'react';
import { Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ComboBoxInput from '@/components/ui/ComboBoxInput';
import NumericInput from '@/components/components/NumericInput';

export type ManualProduct = {
  name: string;
  type: string;
  unit: string;
  quantity: number;
  price?: number; // solo se usa para venta
};

export type ProductOption = {
  id: string;
  name: string;
  type: string;
  unit: string;
  valueType: 'INTEGER' | 'DECIMAL';
  price: number;
};

type Props = {
  value: ManualProduct[];
  onChange: (updated: ManualProduct[]) => void;
  products: ProductOption[];
  mode?: 'upload' | 'sell';
};

export default function ManualProductTable({
  value,
  onChange,
  products,
  mode = 'upload',
}: Props) {
  const [unitTypes, setUnitTypes] = useState<
    Record<number, 'INTEGER' | 'DECIMAL'>
  >({});
  const [disabledQuantity, setDisabledQuantity] = useState<
    Record<number, boolean>
  >({});

  const handleChange = (
    index: number,
    field: keyof ManualProduct,
    val: string | number,
  ) => {
    const updated = [...value];

    if (field === 'quantity' || field === 'price') {
      updated[index][field] = typeof val === 'number' ? val : Number(val);
    } else if (field === 'name') {
      updated[index].name = val as string;
      const match = products.find((p) => p.name === val);
      if (match) {
        updated[index].type = match.type;
        updated[index].unit = match.unit;
        updated[index].quantity = 0; // Reset cantidad al cambiar producto
        setUnitTypes((prev) => ({ ...prev, [index]: match.valueType }));
        setDisabledQuantity((prev) => ({ ...prev, [index]: false }));
        if (mode === 'sell') updated[index].price = match.price;
      } else {
        updated[index].type = '';
        updated[index].unit = '';
        updated[index].quantity = 0;
        setDisabledQuantity((prev) => ({ ...prev, [index]: true }));
      }
    } else {
      updated[index][field] = val as string;
    }

    onChange(updated);
  };

  const handleAddRow = () => {
    const nextIndex = value.length;
    setDisabledQuantity((prev) => ({ ...prev, [nextIndex]: true }));
    onChange([
      ...value,
      {
        name: '',
        type: '',
        unit: '',
        quantity: 0,
        ...(mode === 'sell' ? { price: 0 } : {}),
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    const updated = [...value];
    updated.splice(index, 1);

    // Rebuild control states
    const newUnitTypes: typeof unitTypes = {};
    const newDisabled: typeof disabledQuantity = {};
    updated.forEach((_, i) => {
      newUnitTypes[i] = unitTypes[i >= index ? i + 1 : i];
      newDisabled[i] = disabledQuantity[i >= index ? i + 1 : i];
    });

    setUnitTypes(newUnitTypes);
    setDisabledQuantity(newDisabled);
    onChange(updated);
  };

  return (
    <div className='space-y-4'>
      <div className='hidden lg:grid grid-cols-6 gap-2 font-medium text-sm text-gray-600'>
        <span>Nombre</span>
        <span>Tipo</span>
        <span>Unidad</span>
        <span>Cantidad</span>
        {mode === 'sell' && <span>Precio Venta</span>}
        <span>Acción</span>
      </div>

      {value.map((product, index) => {
        const allowDecimal = unitTypes[index] === 'DECIMAL';
        const isDisabled = disabledQuantity[index];

        return (
          <div
            key={index}
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 items-center border rounded p-3'
          >
            <ComboBoxInput
              options={products.map((p) => p.name)}
              value={product.name}
              onChange={(val) => handleChange(index, 'name', val)}
            />

            <span className='text-sm text-gray-700 hidden lg:block'>
              {product.type || '-'}
            </span>
            <span className='text-sm text-gray-700 hidden lg:block'>
              {product.unit || '-'}
            </span>

            <NumericInput
              value={product.quantity}
              onChange={(val) => handleChange(index, 'quantity', val)}
              allowDecimal={allowDecimal}
              disabled={isDisabled}
            />

            {mode === 'sell' && (
              <NumericInput
                value={product.price ?? 0}
                onChange={(val) => handleChange(index, 'price', val)}
                allowDecimal={true}
                disabled={isDisabled}
              />
            )}

            <div className='flex justify-start lg:justify-center'>
              <button
                className='text-red-600 hover:text-red-800 p-1'
                onClick={() => handleRemoveRow(index)}
              >
                <Trash className='w-4 h-4' />
              </button>
            </div>

            <div className='sm:hidden col-span-1 flex flex-col text-xs text-gray-500 mt-1'>
              <span>Tipo: {product.type || '-'}</span>
              <span>Unidad: {product.unit || '-'}</span>
            </div>
          </div>
        );
      })}

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
