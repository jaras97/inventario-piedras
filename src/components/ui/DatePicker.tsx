// components/ui/DatePicker.tsx
'use client';

import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Calendar } from '@/components/ui/Calendar';
import { format } from 'date-fns';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function DatePicker({ label, value, onChange }: Props) {
  return (
    <div>
      <label className='text-sm block mb-1 font-medium text-gray-700'>
        {label}
      </label>
      <Popover className='relative'>
        <PopoverButton className='w-full border rounded px-3 py-2 text-left text-sm bg-white'>
          {value
            ? format(new Date(value), 'dd/MM/yyyy')
            : 'Selecciona una fecha'}
        </PopoverButton>
        <PopoverPanel className='absolute z-10 bg-white mt-2 rounded shadow-md'>
          <Calendar
            mode='single'
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => date && onChange(date.toISOString())}
          />
        </PopoverPanel>
      </Popover>
    </div>
  );
}
