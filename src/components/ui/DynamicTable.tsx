'use client';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from '@tanstack/react-table';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import Pagination from './Pagination';

type DynamicTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  title?: string;
  rowActions?: (row: TData) => React.ReactNode;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
};

export function DynamicTable<TData>({
  columns,
  data,
  isLoading = false,
  title,
  rowActions,
  pagination,
}: DynamicTableProps<TData>) {
  const [openRowIndex, setOpenRowIndex] = useState<number | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-32'>
        <Loader2 className='animate-spin w-6 h-6 text-blue-500' />
        <span className='ml-2'>Cargando...</span>
      </div>
    );
  }

  return (
    <div className='p-4 bg-white border rounded-xl shadow-md'>
      {title && (
        <h2 className='text-xl font-bold mb-4 text-gray-800'>{title}</h2>
      )}

      {/* Desktop */}
      <div className='hidden md:block'>
        <table className='min-w-full text-sm text-left border-collapse'>
          <thead className='bg-gray-100'>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className='px-4 py-3 border-b text-gray-700 font-medium'
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
                {rowActions && <th className='px-4 py-3 border-b'>Acciones</th>}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className='hover:bg-gray-50 transition-colors'>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className='px-4 py-3 border-b text-gray-600'
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                {rowActions && (
                  <td className='px-4 py-3 border-b'>
                    {rowActions(row.original)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile (acordeón) */}
      <div className='md:hidden space-y-2'>
        {table.getRowModel().rows.map((row, index) => {
          const isOpen = openRowIndex === index;
          return (
            <div
              key={row.id}
              className='border rounded-lg shadow-md transition-all duration-300 bg-white'
            >
              <button
                onClick={() => setOpenRowIndex(isOpen ? null : index)}
                className='w-full flex items-center justify-between p-4 font-semibold bg-gray-100 rounded-t-lg text-gray-800'
              >
                <span>
                  {flexRender(
                    row.getVisibleCells()[0].column.columnDef.cell,
                    row.getVisibleCells()[0].getContext(),
                  )}
                </span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isOpen ? 'max-h-[1000px] p-4' : 'max-h-0'
                }`}
              >
                <div className='space-y-2 text-sm text-gray-600'>
                  {row.getVisibleCells().map((cell, i) => {
                    const header = table.getAllColumns()[i]?.columnDef.header;
                    return (
                      <div key={cell.id} className='flex justify-between'>
                        <span className='text-gray-700 font-extrabold'>
                          {typeof header === 'string' ? header : ''}
                        </span>
                        <span>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </span>
                      </div>
                    );
                  })}
                  {rowActions && (
                    <div className='pt-2'>{rowActions(row.original)}</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginación */}
      {pagination && (
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}
