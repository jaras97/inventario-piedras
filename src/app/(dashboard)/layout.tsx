'use client';

import SidebarLayout from '@/components/layouts/SidebarLayout';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <div className='min-h-screen bg-gray-50'>
        {/* Contenedor principal */}
        <SidebarLayout />

        {/* Contenido */}
        <main className='flex-1 p-4 sm:p-6 overflow-auto lg:ml-64'>
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
