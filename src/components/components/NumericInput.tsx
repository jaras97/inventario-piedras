'use client';

import { forwardRef } from 'react';
import { NumericFormat } from 'react-number-format';
import { cn } from '@/lib/utils';

interface NumericInputProps {
  label?: string;
  error?: string;
  allowDecimal?: boolean;
  value?: number;
  onChange?: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      label,
      error,
      allowDecimal = true,
      value,
      onChange,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <div>
        {label && (
          <label className='text-sm block mb-1 font-medium text-gray-700'>
            {label}
          </label>
        )}

        <NumericFormat
          getInputRef={ref}
          value={value}
          allowNegative={false}
          thousandSeparator='.'
          decimalScale={allowDecimal ? 3 : 0}
          fixedDecimalScale={false}
          decimalSeparator=','
          onValueChange={({ floatValue }) => {
            if (floatValue !== undefined) {
              onChange?.(floatValue);
            } else {
              onChange?.(0);
            }
          }}
          className={cn(
            'w-full border rounded px-3 py-2 text-sm',
            error && 'border-red-500',
            className,
          )}
          disabled={disabled}
          inputMode={allowDecimal ? 'decimal' : 'numeric'}
          {...props}
        />

        {error && <p className='text-sm text-red-500 mt-1'>{error}</p>}
      </div>
    );
  },
);

NumericInput.displayName = 'NumericInput';
export default NumericInput;
