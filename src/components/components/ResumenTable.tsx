'use client';

import React from 'react';

type ResumenRow = {
  label: string;
  value: string | number;
};

type ResumenTableProps = {
  title?: string;
  rows: ResumenRow[];
};

export default function ResumenTable({ title, rows }: ResumenTableProps) {
  return (
    <div className='my-6'>
      {title && <h2 className='text-md font-semibold mb-2'>{title}</h2>}
      <div className='overflow-x-auto rounded-lg shadow-md'>
        <table className='min-w-full text-sm border border-gray-200'>
          <thead className='bg-gray-100 text-left'>
            <tr>
              {rows.map((row, idx) => (
                <th key={idx} className='px-4 py-2 border-b'>
                  {row.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className='bg-white'>
              {rows.map((row, idx) => (
                <td key={idx} className='px-4 py-2 border-b'>
                  {row.value}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
