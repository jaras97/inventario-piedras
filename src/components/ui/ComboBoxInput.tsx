'use client';

import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ComboBoxInputProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ComboBoxInput({
  value,
  options,
  onChange,
  placeholder = 'Selecciona...',
}: ComboBoxInputProps) {
  const [query, setQuery] = useState('');

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) =>
          option.toLowerCase().includes(query.toLowerCase()),
        );

  return (
    <Combobox value={value} onChange={onChange}>
      <div className='relative w-full'>
        <div className='relative w-full'>
          <ComboboxInput
            className='block w-full rounded border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 overflow-x-auto whitespace-nowrap'
            style={{
              textOverflow: 'unset',
              whiteSpace: 'nowrap',
              overflowX: 'auto',
              minWidth: '0', // 👈 importante para flex/grid
              maxWidth: '100%', // 👈 asegura que no colapse en containers
            }}
            onChange={(e) => setQuery(e.target.value)}
            displayValue={() => value}
            placeholder={placeholder}
            title={value}
          />
          <ComboboxButton className='absolute inset-y-0 right-0 flex items-center pr-3'>
            <ChevronDown className='h-4 w-4 text-gray-500' />
          </ComboboxButton>
        </div>

        {filteredOptions.length > 0 && (
          <ComboboxOptions
            className={cn(
              'absolute z-10 mt-1 max-h-60 w-full min-w-[10rem] overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none',
            )}
          >
            {filteredOptions.map((option, index) => (
              <ComboboxOption
                key={index}
                value={option}
                className={({ active }) =>
                  cn(
                    'relative cursor-pointer select-none py-2 pl-10 pr-4 whitespace-normal break-words',
                    active ? 'bg-blue-600 text-white' : 'text-gray-900',
                  )
                }
              >
                {({ selected }) => (
                  <>
                    <span
                      className={cn(
                        'block',
                        selected ? 'font-semibold' : 'font-normal',
                      )}
                      title={option} // Tooltip para ver el texto completo
                    >
                      {option}
                    </span>
                    {selected && (
                      <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600'>
                        <Check className='h-4 w-4' aria-hidden='true' />
                      </span>
                    )}
                  </>
                )}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        )}
      </div>
    </Combobox>
  );
}
