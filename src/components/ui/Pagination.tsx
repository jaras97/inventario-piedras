'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className='flex flex-col gap-2 items-center justify-center mt-6 md:flex-row md:justify-between'>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className='flex items-center gap-1 px-4 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <ChevronLeft className='w-4 h-4' />
        <span>Anterior</span>
      </button>

      <span className='text-sm text-gray-600'>
        Página <strong>{page}</strong> de <strong>{totalPages}</strong>
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className='flex items-center gap-1 px-4 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <span>Siguiente</span>
        <ChevronRight className='w-4 h-4' />
      </button>
    </div>
  );
}
