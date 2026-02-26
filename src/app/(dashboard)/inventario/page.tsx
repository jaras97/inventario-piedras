'use client';

import { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import LoadModal from '@/components/inventory/LoadModal';
import SellModal from '@/components/inventory/SellModal';
import { DynamicTable } from '@/components/ui/DynamicTable';
import InventoryFilters, {
  InventoryFilters as FilterValues,
} from '@/components/inventory/InventoryFilters';
import { Loader2, Plus, Upload, Pencil } from 'lucide-react';

import GroupUploadModal from '@/components/ui/GroupUploadModal';
import { useSession } from 'next-auth/react';
import { hasWriteAccess } from '@/lib/auth/roles';
import GroupSellModal from '@/components/ui/GroupSellModal';
import EditProductModal from '@/components/inventory/EditProductModal';
import { formatNumber } from '@/lib/utils/format';
import { useMessageStore } from '@/store/messageStore';
import Message from '@/components/ui/Message';
import CreateProductModal from '@/components/inventory/CreateProductModal';
import AdjustModal from '@/components/inventory/AdjustModal';

type Inventory = {
  id: string;
  name: string;
  categoryId: string;
  category: { name: string; id: string };
  unit: { id: string; name: string; valueType: 'INTEGER' | 'DECIMAL' };
  quantity: number;
  subcategoryCode?: { id: string; code: string } | null;
  price: number;
};

type ModalType = 'LOAD' | 'SELL' | 'ADJUST' | null;

export default function InventarioPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? '';
  const isAdmin = hasWriteAccess(role);

  const { setMessage } = useMessageStore.getState();

  const [groupSellOpen, setGroupSellOpen] = useState(false);
  const [data, setData] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Inventory | null>(null);
  const [filters, setFilters] = useState<FilterValues>({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [units, setUnits] = useState<{ id: string; name: string }[]>([]);

  const openModal = (item: Inventory, type: ModalType) => {
    setSelectedItem(item);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setModalType(null);
  };

  const handleEdit = (item: Inventory) => {
    setEditingProduct(item);
    setEditModalOpen(true);
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
        ...(filters.name && { name: filters.name }),
        ...(filters.category && { category: filters.category }), // <-- FIX: type → category
        ...(filters.unit && { unit: filters.unit }),
        ...(filters.code && { code: filters.code }), // <-- asegúrate que el backend lo use
      });

      const res = await fetch(`/api/inventario?${query.toString()}`);
      const json = await res.json();
      setData(json.data);
      setTotal(json.total);
    } catch (err) {
      console.error('Error al cargar inventario', err);
      setMessage('error', 'Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, filters]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const res = await fetch('/api/inventario/metadata');
      const json = await res.json();
      setCategories(json.categories || []);
      setUnits(json.units || []);
    } catch (err) {
      console.error('Error al cargar metadata de inventario', err);
      setMessage('error', 'Error al cargar metadata');
    }
  };

  const columns: ColumnDef<Inventory>[] = [
    { accessorKey: 'name', header: 'Nombre' },
    {
      accessorKey: 'category.name',
      header: 'Categoría',
      cell: (info) => info.row.original.category.name,
    },
    {
      accessorKey: 'subcategoryCode.code',
      header: 'Código',
      cell: (info) =>
        info.row.original.subcategoryCode?.code || (
          <span className='text-gray-400 italic'>Sin código</span>
        ),
    },
    {
      accessorKey: 'unit.name',
      header: 'Unidad',
      cell: (info) => info.row.original.unit.name,
    },
    {
      header: 'Cantidad',
      accessorKey: 'quantity',
      cell: ({ getValue }) => formatNumber(getValue<number>(), 3),
    },
    {
      header: 'Precio',
      accessorKey: 'price',
      cell: ({ getValue }) => formatNumber(getValue<number>(), 3),
    },
  ];

  return (
    <div className='p-4'>
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4'>
        <h1 className='text-xl font-bold text-gray-800 text-center sm:text-left'>
          Inventario
        </h1>
        <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
          {isAdmin && (
            <>
              <button
                onClick={() => setCreateModalOpen(true)}
                className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm flex items-center justify-center gap-2'
              >
                <Plus className='w-4 h-4' />
                Nuevo Producto
              </button>

              <button
                onClick={() => setBulkUploadOpen(true)}
                className='bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition text-sm flex items-center justify-center gap-2'
              >
                <Upload className='w-4 h-4' />
                Cargue Grupal
              </button>

              <button
                onClick={() => setGroupSellOpen(true)}
                className='bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700 transition text-sm flex items-center justify-center gap-2'
              >
                <Upload className='w-4 h-4' />
                Venta Grupal
              </button>
            </>
          )}
        </div>
      </div>

      <InventoryFilters
        fields={['name', 'category', 'code', 'unit']}
        onChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
        types={categories}
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
          rowActions={(item) =>
            isAdmin && (
              <div className='flex gap-2'>
                <button
                  className='bg-blue-600 text-white px-2 py-1 rounded text-xs'
                  onClick={() => openModal(item, 'LOAD')}
                >
                  <Upload className='w-4 h-4' />
                </button>
                <button
                  className='bg-red-600 text-white px-2 py-1 rounded text-xs'
                  onClick={() => openModal(item, 'SELL')}
                >
                  <Upload className='w-4 h-4' />
                </button>
                <button
                  className='bg-gray-600 text-white px-2 py-1 rounded text-xs'
                  onClick={() => handleEdit(item)}
                >
                  <Pencil className='w-4 h-4' />
                </button>
                <button
                  className='bg-yellow-600 text-white px-2 py-1 rounded text-xs disabled:opacity-50'
                  onClick={() => openModal(item, 'ADJUST')}
                >
                  Ajustar
                </button>
              </div>
            )
          }
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: (p) => setPage(p),
          }}
        />
      )}

      {/* MODALES */}
      {modalType === 'LOAD' && selectedItem && (
        <LoadModal
          item={selectedItem}
          open={true}
          onClose={closeModal}
          onSuccess={fetchInventory}
        />
      )}
      {modalType === 'SELL' && selectedItem && (
        <SellModal
          itemId={selectedItem.id}
          unitId={selectedItem.unit.id}
          open={true}
          onClose={closeModal}
          onSuccess={fetchInventory}
        />
      )}
      {modalType === 'ADJUST' && selectedItem && (
        <AdjustModal
          item={selectedItem}
          open={true}
          onClose={closeModal}
          onSuccess={fetchInventory}
        />
      )}

      <CreateProductModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchInventory}
      />

      <GroupUploadModal
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        onSuccess={fetchInventory}
      />

      <GroupSellModal
        open={groupSellOpen}
        onClose={() => setGroupSellOpen(false)}
        onSuccess={fetchInventory}
      />

      <EditProductModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={fetchInventory}
        product={editingProduct}
        types={categories}
      />

      <Message />
    </div>
  );
}
