'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Calendar } from '@/components/ui/Calendar';

export type InventoryFilters = {
  name?: string;
  type?: string;
  unit?: string;
  quantity?: number;
  user?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type FilterField =
  | 'name'
  | 'type'
  | 'unit'
  | 'quantity'
  | 'user'
  | 'date';

type Props = {
  onChange: (filters: InventoryFilters) => void;
  fields: FilterField[];
  loading?: boolean;
  types?: { id: string; name: string }[];
  units?: { id: string; name: string }[];
};

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
    const newFilters = {
      ...filters,
      dateFrom: range?.from?.toISOString(),
      dateTo: range?.to?.toISOString(),
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

      {fields.includes('type') && (
        <select
          name='type'
          className='border border-gray-300 rounded px-3 py-2 text-sm w-full'
          onChange={handleInputChange}
        >
          <option value=''>Tipo</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
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
