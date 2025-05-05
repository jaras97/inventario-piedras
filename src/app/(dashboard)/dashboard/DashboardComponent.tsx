'use client';
import LogoutButton from '@/components/LogoutButton';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import React, { useEffect } from 'react';

const DashboardComponent = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && !session?.user?.isAuthorized) {
      signOut({ callbackUrl: '/login' });
    }
  }, [status, session, router]);

  if (status === 'loading') return <p>Cargando...</p>;
  if (!session?.user?.isAuthorized) return <p>Volviendo al Login...</p>;

  return (
    <main className='p-8'>
      <LogoutButton />
      <h1>Bienvenido al dashboard</h1>
    </main>
  );
};

export default DashboardComponent;
