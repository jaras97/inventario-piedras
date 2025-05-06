'use client';

import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import LoadModal from '@/components/inventory/LoadModal';
import SellModal from '@/components/inventory/SellModal';
import { DynamicTable } from '@/components/ui/DynamicTable';
import InventoryFilters, {
  InventoryFilters as FilterValues,
} from '@/components/inventory/InventoryFilters';
import { Loader2, Plus, Upload } from 'lucide-react';
import CreateProductModal from '@/components/inventory/CreateProductModal';
import GroupUploadModal from '@/components/ui/GroupUploadModal';

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
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

  const [filters, setFilters] = useState<FilterValues>({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const [types, setTypes] = useState<{ id: string; name: string }[]>([]);
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);

  const openModal = (id: string, type: ModalType) => {
    setSelectedItemId(id);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedItemId(null);
    setModalType(null);
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(filters.name && { name: filters.name }),
        ...(filters.type && { type: filters.type }),
        ...(filters.unit && { unit: filters.unit }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.quantity && { quantity: filters.quantity.toString() }),
      });

      const res = await fetch(`/api/inventario?${query.toString()}`);
      const json = await res.json();
      setData(json.data);
      setTotal(json.total);
    } catch (err) {
      console.error('Error al cargar inventario', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

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

  const columns: ColumnDef<Inventory>[] = [
    { accessorKey: 'name', header: 'Nombre' },
    { accessorKey: 'type', header: 'Tipo' },
    { accessorKey: 'unit', header: 'Unidad' },
    { accessorKey: 'quantity', header: 'Cantidad' },
  ];

  return (
    <div className='p-4'>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-xl font-bold text-gray-800'>Inventario</h1>
        <div className='flex gap-2'>
          <button
            onClick={() => setCreateModalOpen(true)}
            className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm flex items-center gap-2'
          >
            <Plus className='w-4 h-4' />
            Nuevo Producto
          </button>
          <button
            onClick={() => setBulkUploadOpen(true)}
            className='bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition text-sm flex items-center gap-2'
          >
            <Upload className='w-4 h-4' />
            Cargue Grupal
          </button>
        </div>
      </div>

      <InventoryFilters
        fields={['name', 'type', 'unit', 'quantity']}
        onChange={(newFilters) => {
          setFilters(newFilters);
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
          title='Inventario'
          data={data ?? []}
          columns={columns}
          isLoading={loading}
          rowActions={(item) => (
            <div className='flex gap-2'>
              <button
                className='bg-blue-600 text-white px-2 py-1 rounded text-xs'
                onClick={() => openModal(item.id, 'LOAD')}
              >
                Cargar
              </button>
              <button
                className='bg-red-600 text-white px-2 py-1 rounded text-xs'
                onClick={() => openModal(item.id, 'SELL')}
              >
                Vender
              </button>
            </div>
          )}
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: (p) => setPage(p),
          }}
        />
      )}

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
      {createModalOpen && (
        <CreateProductModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={fetchInventory}
        />
      )}

      {bulkUploadOpen && (
        <GroupUploadModal
          open={bulkUploadOpen}
          onClose={() => setBulkUploadOpen(false)}
          onSuccess={fetchInventory}
        />
      )}
    </div>
  );
}
