'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Calendar } from '@/components/ui/Calendar';
import { TransactionType } from '@prisma/client';

export type InventoryFilters = {
  name?: string;
  type?: string;
  unit?: string;
  code?: string;
  quantity?: number;
  user?: string;
  dateFrom?: string;
  dateTo?: string;
  category?: string;
};

export type FilterField =
  | 'name'
  | 'type'
  | 'unit'
  | 'code'
  | 'quantity'
  | 'user'
  | 'date'
  | 'category';

type TypeWithCodes = {
  id: string;
  name: string;
  codes?: { id: string; code: string }[];
};

type Props = {
  onChange: (filters: InventoryFilters) => void;
  fields: FilterField[];
  loading?: boolean;
  types?: TypeWithCodes[];
  units?: { id: string; name: string }[];
};

const transactionTypeOptions: { value: TransactionType; label: string }[] = [
  { value: 'CARGA_INDIVIDUAL', label: 'Carga individual' },
  { value: 'CARGA_GRUPAL', label: 'Carga grupal' },
  { value: 'VENTA_INDIVIDUAL', label: 'Venta individual' },
  { value: 'VENTA_GRUPAL', label: 'Venta grupal' },
  { value: 'EDICION_PRODUCTO', label: 'Edición de producto' },
];

export default function InventoryFilters({
  onChange,
  fields,
  types = [],
  units = [],
}: Props) {
  const [filters, setFilters] = useState<InventoryFilters>({});
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value === '' ? undefined : value,
    };
    setFilters(newFilters);
    onChange(newFilters);
  };

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);

    const dateFrom = range?.from
      ? new Date(range.from.setHours(0, 0, 0, 0)).toISOString()
      : undefined;

    const dateTo = range?.to
      ? new Date(range.to.setHours(23, 59, 59, 999)).toISOString()
      : undefined;

    const newFilters = {
      ...filters,
      dateFrom,
      dateTo,
    };

    setFilters(newFilters);
    onChange(newFilters);
  };

  return (
    <div className='grid md:grid-cols-4 gap-4 mb-4'>
      {fields.includes('name') && (
        <input
          type='text'
          name='name'
          placeholder='Buscar por nombre'
          className='border border-gray-300 rounded px-3 py-2 text-sm w-full'
          onChange={handleInputChange}
        />
      )}

      {fields.includes('category') && (
        <select
          name='category'
          className='border border-gray-300 rounded px-3 py-2 text-sm w-full'
          onChange={handleInputChange}
        >
          <option value=''>Categoría</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {' '}
              {/* ← Asegúrate de usar el id aquí */}
              {t.name}
            </option>
          ))}
        </select>
      )}

      {fields.includes('type') && (
        <select
          name='type'
          className='border border-gray-300 rounded px-3 py-2 text-sm w-full'
          onChange={handleInputChange}
        >
          <option value=''>Tipo de transacción</option>
          {transactionTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {fields.includes('code') && (
        <select
          name='code'
          className={`border px-3 py-2 text-sm w-full rounded ${
            !filters.category
              ? 'bg-gray-100 cursor-not-allowed text-gray-400'
              : 'border-gray-300'
          }`}
          onChange={handleInputChange}
          disabled={!filters.category}
          value={filters.code ?? ''}
        >
          <option value=''>
            {filters.category
              ? 'Subcategoría'
              : 'Seleccione una categoría primero'}
          </option>
          {filters.category &&
            types
              .find((t) => t.id === filters.category)
              ?.codes?.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code}
                </option>
              ))}
        </select>
      )}

      {fields.includes('unit') && (
        <select
          name='unit'
          className='border border-gray-300 rounded px-3 py-2 text-sm w-full'
          onChange={handleInputChange}
        >
          <option value=''>Unidad</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      )}

      {fields.includes('quantity') && (
        <input
          type='number'
          name='quantity'
          placeholder='Cantidad'
          className='border border-gray-300 rounded px-3 py-2 text-sm w-full'
          onChange={handleInputChange}
        />
      )}

      {fields.includes('user') && (
        <input
          type='text'
          name='user'
          placeholder='Usuario'
          className='border border-gray-300 rounded px-3 py-2 text-sm w-full'
          onChange={handleInputChange}
        />
      )}

      {fields.includes('date') && (
        <Popover className='relative'>
          <PopoverButton className='border border-gray-300 rounded px-3 py-2 text-sm w-full flex items-center justify-between'>
            <span>
              {dateRange?.from && dateRange?.to
                ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(
                    dateRange.to,
                    'dd/MM/yyyy',
                  )}`
                : 'Rango de fechas'}
            </span>
            <CalendarIcon className='w-4 h-4 text-gray-500 ml-2' />
          </PopoverButton>

          <PopoverPanel className='absolute z-10 bg-white p-4 mt-2 rounded shadow-md border'>
            <Calendar
              mode='range'
              selected={dateRange}
              onSelect={handleDateChange}
              numberOfMonths={1}
            />
          </PopoverPanel>
        </Popover>
      )}
    </div>
  );
}
