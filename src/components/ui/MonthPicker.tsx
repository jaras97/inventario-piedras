'use client';

import { Listbox } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';

type Props = {
  label: string;
  value: { year: number; month: number };
  onChange: (value: { year: number; month: number }) => void;
};

const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

export function MonthYearPicker({ label, value, onChange }: Props) {
  return (
    <div>
      <label className='text-sm block mb-1 font-medium text-gray-700'>
        {label}
      </label>
      <div className='grid grid-cols-2 gap-2'>
        <Listbox
          value={value.month}
          onChange={(month) => onChange({ ...value, month })}
        >
          <div className='relative'>
            <Listbox.Button className='w-full border rounded px-3 py-2 bg-white text-left text-sm flex justify-between items-center'>
              {months[value.month - 1]}
              <ChevronDown className='w-4 h-4 text-gray-500' />
            </Listbox.Button>
            <Listbox.Options className='absolute mt-1 w-full bg-white shadow-md rounded text-sm z-10'>
              {months.map((month, i) => (
                <Listbox.Option key={i + 1} value={i + 1}>
                  <div className='px-4 py-2 hover:bg-gray-100'>{month}</div>
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>

        <Listbox
          value={value.year}
          onChange={(year) => onChange({ ...value, year })}
        >
          <div className='relative'>
            <Listbox.Button className='w-full border rounded px-3 py-2 bg-white text-left text-sm flex justify-between items-center'>
              {value.year}
              <ChevronDown className='w-4 h-4 text-gray-500' />
            </Listbox.Button>
            <Listbox.Options className='absolute mt-1 w-full bg-white shadow-md rounded text-sm z-10'>
              {years.map((year) => (
                <Listbox.Option key={year} value={year}>
                  <div className='px-4 py-2 hover:bg-gray-100'>{year}</div>
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>
    </div>
  );
}
