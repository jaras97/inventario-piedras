'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSWRConfig } from 'swr';

export function CategoryForm() {
  const [name, setName] = useState('');
  const { mutate } = useSWRConfig();

  const handleSubmit = async () => {
    if (!name.trim()) return;

    await fetch('/api/categorias', {
      method: 'POST',
      body: JSON.stringify({ name }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    setName('');
    mutate('/api/categorias'); // actualiza la lista
  };

  return (
    <div className='mb-6 max-w-md space-y-2'>
      <h2 className='text-lg font-semibold'>Nueva categoría</h2>
      <div className='flex items-center gap-2'>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Ej. Rubí'
        />
        <Button onClick={handleSubmit}>Crear</Button>
      </div>
    </div>
  );
}
