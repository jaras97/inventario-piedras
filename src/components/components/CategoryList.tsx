'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryWithCodes } from '@/types/category';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function CategoryList() {
  const { data: categories, mutate } = useSWR<CategoryWithCodes[]>(
    '/api/categorias',
    fetcher,
  );

  const [newCodes, setNewCodes] = useState<Record<string, string>>({});
  const [errorCodes, setErrorCodes] = useState<Record<string, string>>({});

  const handleAddCode = async (categoryId: string) => {
    const code = newCodes[categoryId];
    if (!code?.trim()) return;

    const res = await fetch(`/api/categorias/${categoryId}/codigos`, {
      method: 'POST',
      body: JSON.stringify({ code }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const err = await res.json();
      setErrorCodes((prev) => ({
        ...prev,
        [categoryId]: err.error || 'Error al agregar código',
      }));
      return;
    }

    setNewCodes((prev) => ({ ...prev, [categoryId]: '' }));
    setErrorCodes((prev) => ({ ...prev, [categoryId]: '' }));
    mutate();
  };

  return (
    <div>
      {categories?.map((category) => (
        <div key={category.id} className='mb-6 border-b pb-4'>
          <h3 className='font-semibold text-blue-600'>{category.name}</h3>

          <ul className='text-sm mt-2 pl-4 list-disc'>
            {category.codes.map((c) => (
              <li key={c.id}>{c.code}</li>
            ))}
          </ul>

          <div className='flex items-center gap-2 mt-2'>
            <Input
              placeholder='Nuevo código (ej. R03)'
              value={newCodes[category.id] || ''}
              onChange={(e) =>
                setNewCodes((prev) => ({
                  ...prev,
                  [category.id]: e.target.value,
                }))
              }
            />
            <Button onClick={() => handleAddCode(category.id)}>
              Agregar código
            </Button>
          </div>

          {errorCodes[category.id] && (
            <p className='text-sm text-red-500 mt-1'>
              {errorCodes[category.id]}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
