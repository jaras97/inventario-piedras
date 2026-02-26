'use client';

import { useState, Fragment, useEffect } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { LabeledInput } from '@/components/ui/LabeledInput';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/Select';
import { UserRecord } from '@/types/types';
import omit from 'lodash/omit';

interface UserModalProps {
  user: UserRecord | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function UserModal({
  user,
  open,
  onClose,
  onSave,
}: UserModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: string;
    isAuthorized: boolean;
    password?: string;
  }>({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'USER',
    isAuthorized: user?.isAuthorized || false,
    password: '',
  });

  const roleOptions = [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Usuario', value: 'USER' },
    { label: 'Auditor', value: 'AUDITOR' },
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'USER',
        isAuthorized: user.isAuthorized ?? false,
        password: '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'USER',
        isAuthorized: false,
        password: '',
      });
    }
  }, [user]);

  const isEditMode = !!user;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async () => {
    const method = isEditMode ? 'PUT' : 'POST';
    const endpoint = isEditMode ? `/api/users/${user?.id}` : '/api/users';

    const payload = isEditMode ? omit(formData, 'password') : formData;

    await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    onSave();
    onClose();
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={onClose}>
        <div
          className='fixed inset-0 bg-black/30 backdrop-blur-sm'
          aria-hidden='true'
        />
        <div className='fixed inset-0 flex items-center justify-center p-4'>
          <TransitionChild
            as={Fragment}
            enter='ease-out duration-200'
            enterFrom='opacity-0 scale-95'
            enterTo='opacity-100 scale-100'
            leave='ease-in duration-150'
            leaveFrom='opacity-100 scale-100'
            leaveTo='opacity-0 scale-95'
          >
            <DialogPanel className='w-full max-w-md rounded bg-white p-6 shadow-xl'>
              <DialogTitle className='text-lg font-medium'>
                {isEditMode ? 'Editar usuario' : 'Nuevo usuario'}
              </DialogTitle>

              <div className='mt-4 space-y-4'>
                <LabeledInput
                  label='Nombre'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                />
                <LabeledInput
                  label='Correo'
                  name='email'
                  type='email'
                  value={formData.email}
                  onChange={handleChange}
                />
                {!isEditMode && (
                  <LabeledInput
                    label='Contraseña'
                    name='password'
                    type='password'
                    value={formData.password}
                    onChange={handleChange}
                  />
                )}
                <Select
                  label='Rol'
                  options={roleOptions}
                  value={
                    roleOptions.find((opt) => opt.value === formData.role) ||
                    null
                  }
                  onChange={(opt) =>
                    setFormData({ ...formData, role: opt.value })
                  }
                />
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    name='isAuthorized'
                    checked={formData.isAuthorized}
                    onChange={handleChange}
                  />
                  Usuario autorizado
                </label>

                <div className='flex justify-end gap-2'>
                  <Button variant='outline' onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmit}>
                    {isEditMode ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
