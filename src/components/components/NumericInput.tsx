'use client';

import {
  InputHTMLAttributes,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

interface NumericInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label?: string;
  error?: string;
  allowDecimal?: boolean;
  value?: number;
  onChange?: (value: number) => void;
}

const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      label,
      error,
      allowDecimal = true,
      className,
      value,
      onChange,
      disabled,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [displayValue, setDisplayValue] = useState('');

    // Evitar scroll en inputs numéricos
    useEffect(() => {
      const input = inputRef.current;
      if (!input) return;
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        input.blur();
      };
      input.addEventListener('wheel', handleWheel, { passive: false });
      return () => input.removeEventListener('wheel', handleWheel);
    }, []);

    // Sincronizar con valor externo
    useEffect(() => {
      if (value === undefined || value === null || isNaN(value)) {
        setDisplayValue('');
      } else {
        const formatted = allowDecimal
          ? value.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })
          : value.toLocaleString();
        setDisplayValue(formatted);
      }
    }, [value, allowDecimal]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const invalidChars = ['e', 'E', '+', '-'];
      if (invalidChars.includes(e.key)) {
        e.preventDefault();
      }
      if (!allowDecimal && e.key === '.') {
        e.preventDefault();
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setDisplayValue(raw); // muestra lo que el usuario está escribiendo

      // Quitar comas y normalizar punto decimal
      const clean = raw.replace(/,/g, '').replace(/[^\d.]/g, '');

      const parsed = allowDecimal ? parseFloat(clean) : parseInt(clean, 10);
      if (!isNaN(parsed)) {
        onChange?.(parsed);
      }
    };

    const handleBlur = () => {
      if (value !== undefined && !isNaN(value)) {
        const formatted = allowDecimal
          ? value.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })
          : value.toLocaleString();
        setDisplayValue(formatted);
      }
    };

    return (
      <div>
        {label && (
          <label className='text-sm block mb-1 font-medium text-gray-700'>
            {label}
          </label>
        )}
        <input
          type='text'
          inputMode={allowDecimal ? 'decimal' : 'numeric'}
          ref={(el) => {
            inputRef.current = el;
            if (typeof ref === 'function') ref(el);
            else if (ref) ref.current = el;
          }}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={cn(
            'w-full border rounded px-3 py-2 text-sm',
            error && 'border-red-500',
            className,
          )}
          disabled={disabled}
          {...props}
        />
        {error && <p className='text-sm text-red-500 mt-1'>{error}</p>}
      </div>
    );
  },
);

NumericInput.displayName = 'NumericInput';
export default NumericInput;
