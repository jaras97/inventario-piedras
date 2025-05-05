// ✅ src/app/historial/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type Transaction = {
  id: string;
  createdAt: string;
  type: 'ENTRADA' | 'SALIDA';
  amount: number;
  itemName: string;
  user: string;
};

export default function HistorialPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const columns: ColumnDef<Transaction>[] = [
    {
      header: 'Fecha',
      accessorFn: (row) => format(new Date(row.createdAt), 'dd/MM/yyyy HH:mm'),
    },
    {
      header: 'Tipo',
      accessorKey: 'type',
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded ${
            row.original.type === 'ENTRADA'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {row.original.type}
        </span>
      ),
    },
    {
      header: 'Cantidad',
      accessorKey: 'amount',
    },
    {
      header: 'Material',
      accessorKey: 'itemName',
    },
    {
      header: 'Usuario',
      accessorKey: 'user',
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/historial');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Error al cargar historial:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className='flex justify-center items-center py-32'>
        <Loader2 className='animate-spin w-6 h-6 text-blue-500' />
        <span className='ml-2'>Cargando historial...</span>
      </div>
    );
  }

  return (
    <div className='p-4'>
      <h1 className='text-xl font-semibold mb-4'>Historial de Movimientos</h1>
      <div className='overflow-auto border rounded'>
        <table className='min-w-full text-sm text-left border-collapse'>
          <thead className='bg-gray-100'>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className='px-4 py-2 border-b'>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className='hover:bg-gray-50'>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className='px-4 py-2 border-b'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
