'use client';

import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';

export function Calendar(props: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      locale={es}
      className='bg-white rounded-md shadow-md p-2'
      {...props}
    />
  );
}
