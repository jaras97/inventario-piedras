'use client';

import React, { useState } from 'react';
import { Plus, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ComboBoxInput from '@/components/ui/ComboBoxInput';
import NumericInput from '@/components/components/NumericInput';

export type ManualProduct = {
  name: string;
  category: string;
  unit: string;
  quantity: number;
  price?: number;
};

export type ProductOption = {
  id: string;
  name: string;
  category: string;
  unit: string;
  valueType: 'INTEGER' | 'DECIMAL';
  price: number;
  quantity: number;
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
  const [warnings, setWarnings] = useState<Record<number, string>>({});

  const handleChange = (
    index: number,
    field: keyof ManualProduct,
    val: string | number,
  ) => {
    const updated = [...value];
    const current = updated[index];

    if (field === 'quantity') {
      const newQty = typeof val === 'number' ? val : Number(val);
      const match = products.find((p) => p.name === current.name);

      if (match && mode === 'sell') {
        if (newQty > match.quantity) {
          updated[index].quantity = match.quantity;
          setWarnings((prev) => ({
            ...prev,
            [index]: `Cantidad ajustada al stock disponible (${match.quantity}) para "${match.name}"`,
          }));
        } else {
          updated[index].quantity = newQty;
          setWarnings((prev) => {
            return Object.fromEntries(
              Object.entries(prev).filter(([key]) => Number(key) !== index),
            );
          });
        }
      } else {
        updated[index].quantity = newQty;
      }
    } else if (field === 'price') {
      updated[index].price = typeof val === 'number' ? val : Number(val);
    } else if (field === 'name') {
      updated[index].name = val as string;
      const match = products.find((p) => p.name === val);
      if (match) {
        updated[index].category = match.category;
        updated[index].unit = match.unit;
        updated[index].quantity = 0;
        setUnitTypes((prev) => ({ ...prev, [index]: match.valueType }));
        setDisabledQuantity((prev) => ({ ...prev, [index]: false }));
        setWarnings((prev) => {
          const rest = Object.fromEntries(
            Object.entries(prev).filter(([key]) => Number(key) !== index),
          );
          return rest;
        });
        if (mode === 'sell') updated[index].price = match.price;
      } else {
        updated[index].category = '';
        updated[index].unit = '';
        updated[index].quantity = 0;
        setDisabledQuantity((prev) => ({ ...prev, [index]: true }));
      }
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
        category: '',
        unit: '',
        quantity: 0,
        ...(mode === 'sell' ? { price: 0 } : {}),
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    const updated = [...value];
    updated.splice(index, 1);

    const newUnitTypes: typeof unitTypes = {};
    const newDisabled: typeof disabledQuantity = {};
    const newWarnings: typeof warnings = {};
    updated.forEach((_, i) => {
      newUnitTypes[i] = unitTypes[i >= index ? i + 1 : i];
      newDisabled[i] = disabledQuantity[i >= index ? i + 1 : i];
      if (warnings[i >= index ? i + 1 : i]) {
        newWarnings[i] = warnings[i >= index ? i + 1 : i];
      }
    });

    setUnitTypes(newUnitTypes);
    setDisabledQuantity(newDisabled);
    setWarnings(newWarnings);
    onChange(updated);
  };

  return (
    <div className='space-y-4'>
      <div className='hidden lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 font-medium text-sm text-gray-600'>
        <span>Nombre</span>
        <span>Categoría</span>
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
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 items-center border rounded p-3'
          >
            <ComboBoxInput
              options={products.map((p) => p.name)}
              value={product.name}
              onChange={(val) => handleChange(index, 'name', val)}
            />

            <span className='text-sm text-gray-700 hidden lg:block'>
              {product.category || '-'}
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

            {warnings[index] && (
              <div className='sm:col-span-2 lg:col-span-6 text-yellow-600 text-xs mt-1'>
                {warnings[index]}
              </div>
            )}

            <div className='sm:hidden col-span-1 flex flex-col text-xs text-gray-500 mt-1'>
              <span>Categoría: {product.category || '-'}</span>
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
