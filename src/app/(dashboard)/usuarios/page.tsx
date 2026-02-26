'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DynamicTable } from '@/components/ui/DynamicTable';
import { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, TrashIcon, PlusIcon } from 'lucide-react';
import { UserRecord } from '@/types/types';
import UserModal from '@/components/components/UserModal';

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('/api/users');
    const json = await res.json();
    setUsers(json.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  const handleOpenModal = (user: UserRecord | null) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const columns: ColumnDef<UserRecord>[] = [
    { header: 'Nombre', accessorKey: 'name' },
    { header: 'Correo', accessorKey: 'email' },
    { header: 'Rol', accessorKey: 'role' },
    {
      header: 'Autorizado',
      accessorKey: 'isAuthorized',
      cell: ({ getValue }) => (getValue() ? 'Sí' : 'No'),
    },
    {
      header: 'Acciones',
      cell: ({ row }) => (
        <div className='flex gap-2'>
          <Button
            size='icon'
            variant='outline'
            onClick={() => handleOpenModal(row.original)}
          >
            <PencilIcon size={16} />
          </Button>
          <Button
            size='icon'
            variant='destructive'
            onClick={() => handleDelete(row.original.id)}
          >
            <TrashIcon size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h1 className='text-xl font-bold'>Gestión de usuarios</h1>
        <Button onClick={() => handleOpenModal(null)}>
          <PlusIcon className='mr-2' size={16} /> Nuevo usuario
        </Button>
      </div>

      <DynamicTable
        title='Usuarios registrados'
        columns={columns}
        data={users}
        isLoading={loading}
      />

      <UserModal
        open={modalOpen}
        user={editingUser}
        onClose={() => setModalOpen(false)}
        onSave={fetchUsers}
      />
    </div>
  );
}
