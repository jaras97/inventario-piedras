'use client';

import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

export default function UnauthorizedPage() {
  useEffect(() => {
    // Cierra la sesión automáticamente
    signOut({ callbackUrl: '/login' });
  }, []);
  return (
    <main className='min-h-screen flex items-center justify-center bg-gray-100 p-4'>
      <div className='bg-white p-6 rounded shadow-md text-center max-w-sm'>
        <h1 className='text-xl font-bold mb-4'>Acceso denegado</h1>
        <p className='text-gray-700'>
          Tu cuenta no tiene permisos para ingresar.
        </p>
      </div>
    </main>
  );
}
