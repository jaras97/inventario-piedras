'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UnitModal from '@/components/components/UnitModal';
import { ColumnDef } from '@tanstack/react-table';
import { DynamicTable } from '@/components/ui/DynamicTable';

type Unidad = {
  id: string;
  name: string;
  valueType: 'INTEGER' | 'DECIMAL';
};

export default function UnidadesPage() {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unidad | null>(null);

  useEffect(() => {
    fetchUnidades();
  }, []);

  const fetchUnidades = async () => {
    setLoading(true);
    const res = await fetch('/api/unidades');
    const json = await res.json();
    setUnidades(json.data || []);
    setLoading(false);
  };

  const columns: ColumnDef<Unidad>[] = [
    {
      header: 'Nombre',
      accessorKey: 'name',
    },
    {
      header: 'Tipo de valor',
      accessorKey: 'valueType',
      cell: ({ row }) =>
        row.original.valueType === 'INTEGER' ? 'Entero' : 'Decimal',
    },
    {
      header: 'Acciones',
      cell: ({ row }) => (
        <button
          onClick={() => {
            setEditingUnit(row.original);
            setModalOpen(true);
          }}
          className='text-blue-600 hover:underline text-sm inline-flex items-center gap-1'
        >
          <Pencil className='w-4 h-4' />
          Editar
        </button>
      ),
    },
  ];

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-xl font-bold'>Unidades de Medida</h1>
        <Button
          onClick={() => {
            setEditingUnit(null);
            setModalOpen(true);
          }}
        >
          <Plus className='w-4 h-4 mr-2' />
          Nueva Unidad
        </Button>
      </div>

      {loading ? (
        <p className='text-sm text-gray-500'>Cargando unidades...</p>
      ) : (
        <div className='overflow-x-auto'>
          <DynamicTable
            title='Unidades registradas'
            data={unidades}
            columns={columns}
            isLoading={loading}
          />
        </div>
      )}

      <UnitModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        unit={editingUnit || undefined}
        onSuccess={fetchUnidades}
      />
    </div>
  );
}
