'use client';

import SidebarLayout from '@/components/layouts/SidebarLayout';
import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className='flex min-h-screen'>
      <SidebarLayout />
      <main className='flex-1 bg-gray-50 p-6 overflow-auto'>{children}</main>
    </div>
  );
}
