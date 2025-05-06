'use client';

import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

import { DynamicTable } from '@/components/ui/DynamicTable';
import InventoryFilters, {
  InventoryFilters as FilterValues,
} from '@/components/inventory/InventoryFilters';
import { Loader2 } from 'lucide-react';

// Tipo para la fila de transacción
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
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FilterValues>({});
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [types, setTypes] = useState<{ id: string; name: string }[]>([]);
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(filters.name && { name: filters.name }),
        ...(filters.type && { type: filters.type }),
        ...(filters.unit && { unit: filters.unit }),
        ...(filters.user && { user: filters.user }),
        ...(filters.quantity && { quantity: filters.quantity.toString() }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      });

      const res = await fetch(`/api/historial?${query}`);
      const json = await res.json();
      setData(json.data);
      setTotal(json.total);
    } catch (err) {
      console.error('Error al cargar historial:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters, page]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const res = await fetch('/api/inventario/metadata');
      const json = await res.json();
      setTypes(json.types || []);
      setUnits(json.units || []);
    } catch (err) {
      console.error('Error al cargar metadata de inventario', err);
    }
  };

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
    { header: 'Cantidad', accessorKey: 'amount' },
    { header: 'Material', accessorKey: 'itemName' },
    { header: 'Usuario', accessorKey: 'user' },
  ];

  return (
    <div className='p-4'>
      <InventoryFilters
        fields={['name', 'type', 'unit', 'user', 'date']}
        onChange={(f) => {
          setFilters(f);
          setPage(1);
        }}
        types={types}
        units={units}
      />

      {loading ? (
        <div className='flex justify-center items-center py-32'>
          <Loader2 className='animate-spin w-6 h-6 text-blue-500' />
          <span className='ml-2 text-sm text-gray-600'>
            Cargando inventario...
          </span>
        </div>
      ) : (
        <DynamicTable
          title='Historial de Movimientos'
          data={data ?? []}
          columns={columns}
          isLoading={loading}
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: setPage,
          }}
        />
      )}
    </div>
  );
}
