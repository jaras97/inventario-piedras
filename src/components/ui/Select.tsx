'use client';

import { Listbox } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';

export type SelectOption = { label: string; value: string };

type Props = {
  label: string;
  options: SelectOption[];
  value: SelectOption | null;
  onChange: (value: SelectOption) => void;
};

export function Select({ label, options, value, onChange }: Props) {
  return (
    <div>
      <label className='text-sm block mb-1 font-medium text-gray-700'>
        {label}
      </label>
      <Listbox value={value} onChange={onChange}>
        <div className='relative'>
          <Listbox.Button className='w-full border rounded px-3 py-2 bg-white text-left text-sm flex justify-between items-center'>
            {value?.label ?? 'Seleccionar'}
            <ChevronDown className='w-4 h-4 text-gray-500' />
          </Listbox.Button>
          <Listbox.Options className='absolute mt-1 w-full bg-white shadow-md rounded text-sm z-10 max-h-60 overflow-auto'>
            {options.map((opt) => (
              <Listbox.Option key={opt.value} value={opt}>
                {({ selected }) => (
                  <div
                    className={`px-4 py-2 hover:bg-gray-100 flex items-center justify-between ${
                      selected ? 'font-semibold' : ''
                    }`}
                  >
                    {opt.label}
                    {selected && <Check className='w-4 h-4 text-blue-500' />}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}
