'use client';

import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [inputWidth, setInputWidth] = useState<number | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      setInputWidth(containerRef.current.offsetWidth);
    }
  }, [containerRef.current?.offsetWidth]);

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) =>
          option.toLowerCase().includes(query.toLowerCase()),
        );

  return (
    <Combobox value={value} onChange={onChange}>
      <div ref={containerRef} className='relative w-full'>
        <div className='relative w-full cursor-default overflow-hidden rounded border border-gray-300 bg-white text-left shadow-sm focus:outline-none sm:text-sm'>
          <ComboboxInput
            className='w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0'
            onChange={(event) => setQuery(event.target.value)}
            displayValue={(option: string) => option}
            placeholder={placeholder}
          />
          <ComboboxButton className='absolute inset-y-0 right-0 flex items-center pr-2'>
            <ChevronDown className='h-4 w-4 text-gray-400' />
          </ComboboxButton>
        </div>

        {filteredOptions.length > 0 && (
          <ComboboxOptions
            anchor='bottom'
            className={cn(
              'absolute z-10 mt-1 max-h-60 overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
              inputWidth ? `w-[${inputWidth}px]` : 'w-full',
            )}
            style={{ width: inputWidth ?? '100%' }}
          >
            {filteredOptions.map((option, index) => (
              <ComboboxOption
                key={index}
                value={option}
                className={({ active }) =>
                  cn(
                    'relative cursor-default select-none py-2 pl-10 pr-4',
                    active ? 'bg-blue-600 text-white' : 'text-gray-900',
                  )
                }
              >
                {({ selected }) => (
                  <>
                    <span
                      className={cn(
                        'block truncate',
                        selected ? 'font-medium' : 'font-normal',
                      )}
                    >
                      {option}
                    </span>
                    {selected && (
                      <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-white'>
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
