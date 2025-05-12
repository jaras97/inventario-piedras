'use client';

import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

import { DynamicTable } from '@/components/ui/DynamicTable';
import InventoryFilters, {
  InventoryFilters as FilterValues,
} from '@/components/inventory/InventoryFilters';
import {
  Edit3,
  Loader2,
  ShoppingBag,
  ShoppingCart,
  Upload,
  UploadCloud,
} from 'lucide-react';
import TransactionDetailModal from '@/components/ui/TransactionDetailModal';
import { TransactionType } from '@prisma/client';
import EditTransactionModal from '@/components/ui/EditTransactionModal';

// Tipo para la fila de transacción
type Transaction = {
  id: string;
  createdAt: string;
  type: TransactionType;
  amount: number;
  price?: number;
  itemName: string;
  user: string;
  isGrouped?: boolean;
  transactionKind?: 'edit' | 'sell' | 'load';
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
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);
  const [isGrouped, setIsGrouped] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

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
      cell: ({ row }) => {
        const type = row.original.type;
        const map = {
          CARGA_INDIVIDUAL: {
            icon: <Upload className='w-4 h-4 mr-1' />,
            label: 'Carga individual',
            bg: 'bg-green-100 text-green-700',
          },
          CARGA_GRUPAL: {
            icon: <UploadCloud className='w-4 h-4 mr-1' />,
            label: 'Carga grupal',
            bg: 'bg-green-100 text-green-700',
          },
          VENTA_INDIVIDUAL: {
            icon: <ShoppingCart className='w-4 h-4 mr-1' />,
            label: 'Venta individual',
            bg: 'bg-red-100 text-red-700',
          },
          VENTA_GRUPAL: {
            icon: <ShoppingBag className='w-4 h-4 mr-1' />,
            label: 'Venta grupal',
            bg: 'bg-red-100 text-red-700',
          },
          EDICION_PRODUCTO: {
            icon: <Edit3 className='w-4 h-4 mr-1' />,
            label: 'Edición',
            bg: 'bg-yellow-100 text-yellow-700',
          },
        };

        const { icon, label, bg } = map[type as keyof typeof map] || {
          icon: null,
          label: type,
          bg: 'bg-gray-100 text-gray-700',
        };

        return (
          <span
            className={`flex items-center px-2 py-1 text-xs font-medium rounded ${bg}`}
          >
            {icon}
            {label}
          </span>
        );
      },
    },
    { header: 'Cantidad', accessorKey: 'amount' },
    { header: 'Material', accessorKey: 'itemName' },
    { header: 'Usuario', accessorKey: 'user' },
    {
      header: 'Acción',
      cell: ({ row }) => (
        <button
          onClick={() => {
            if (row.original.type === 'EDICION_PRODUCTO') {
              setSelectedTransactionId(row.original.id);
              setEditModalOpen(true);
            } else {
              setSelectedTransactionId(row.original.id);
              setIsGrouped(!!row.original.isGrouped);
            }
          }}
          className='text-blue-600 hover:underline text-sm'
        >
          Ver detalle
        </button>
      ),
    },
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

      {selectedTransactionId && !editModalOpen && (
        <TransactionDetailModal
          open={true}
          onClose={() => setSelectedTransactionId(null)}
          transactionId={selectedTransactionId}
          isGrouped={isGrouped}
        />
      )}

      {selectedTransactionId && editModalOpen && (
        <EditTransactionModal
          open={true}
          onClose={() => {
            setSelectedTransactionId(null);
            setEditModalOpen(false);
          }}
          transactionId={selectedTransactionId}
        />
      )}
    </div>
  );
}
