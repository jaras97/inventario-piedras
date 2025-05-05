'use client';

import { useEffect, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import LoadModal from '@/components/inventory/LoadModal';
import SellModal from '@/components/inventory/SellModal';

type Inventory = {
  id: string;
  name: string;
  type: string;
  unit: string;
  quantity: number;
};

type ModalType = 'LOAD' | 'SELL' | null;

export default function InventarioPage() {
  const [data, setData] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);

  const openModal = (id: string, type: ModalType) => {
    setSelectedItemId(id);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedItemId(null);
    setModalType(null);
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventario');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error al cargar inventario', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const table = useReactTable({
    data,
    columns: [
      { accessorKey: 'name', header: 'Nombre' },
      { accessorKey: 'type', header: 'Tipo' },
      { accessorKey: 'unit', header: 'Unidad' },
      { accessorKey: 'quantity', header: 'Cantidad' },
      {
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className='flex gap-2'>
              <button
                className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs shadow-sm'
                onClick={() => openModal(item.id, 'LOAD')}
              >
                Cargar
              </button>
              <button
                className='bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded text-xs shadow-sm'
                onClick={() => openModal(item.id, 'SELL')}
              >
                Vender
              </button>
            </div>
          );
        },
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className='flex justify-center items-center h-full py-32'>
        <Loader2 className='animate-spin w-6 h-6 text-blue-500' />
        <span className='ml-2 text-sm text-gray-600'>
          Cargando inventario...
        </span>
      </div>
    );
  }

  return (
    <div className='max-w-5xl mx-auto'>
      <h1 className='text-2xl font-bold mb-6 text-gray-800'>Inventario</h1>
      <div className='overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm'>
        <table className='min-w-full text-sm text-left'>
          <thead className='bg-gray-100 text-gray-700'>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className='px-5 py-3 border-b'>
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
                  <td key={cell.id} className='px-5 py-3 border-b'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALES */}
      {modalType === 'LOAD' && selectedItemId && (
        <LoadModal
          itemId={selectedItemId}
          open={true}
          onClose={closeModal}
          onSuccess={fetchInventory}
        />
      )}
      {modalType === 'SELL' && selectedItemId && (
        <SellModal
          itemId={selectedItemId}
          open={true}
          onClose={closeModal}
          onSuccess={fetchInventory}
        />
      )}
    </div>
  );
}
