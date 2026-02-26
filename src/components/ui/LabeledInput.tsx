'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils'; // si ya usas una función de clases condicionales

type Props = {
  label: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function LabeledInput({ label, error, className, ...props }: Props) {
  return (
    <div>
      <label
        htmlFor={props.name}
        className='text-sm block mb-1 font-medium text-gray-700'
      >
        {label}
      </label>
      <Input
        {...props}
        className={cn(
          'w-full border rounded px-3 py-2 text-sm',
          error && 'border-red-500',
          className,
        )}
      />
      {error && <p className='text-sm text-red-500 mt-1'>{error}</p>}
    </div>
  );
}
