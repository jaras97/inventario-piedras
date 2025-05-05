'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

export default function SidebarLayout() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className='min-h-screen flex'>
      {/* Sidebar */}
      <aside
        className={`bg-gray-50 text-gray-800 w-64 flex flex-col justify-between p-6 shadow-md z-50 
          ${open ? 'block' : 'hidden'} 
          fixed inset-y-0 left-0 lg:block lg:relative lg:inset-auto lg:h-screen`}
      >
        <div>
          <h2 className='text-2xl font-bold mb-8 text-blue-600'>Inventario</h2>
          <nav className='flex flex-col gap-3'>
            <SidebarLink href='/dashboard' currentPath={pathname}>
              Dashboard
            </SidebarLink>
            <SidebarLink href='/inventario' currentPath={pathname}>
              Inventario
            </SidebarLink>
            <SidebarLink href='/historial' currentPath={pathname}>
              Historial
            </SidebarLink>
          </nav>
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className='flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition mt-6'
        >
          <LogOut className='w-4 h-4' />
          Cerrar sesión
        </button>

        <button
          className='absolute top-4 right-4 block lg:hidden'
          onClick={() => setOpen(false)}
        >
          <X className='text-gray-600' />
        </button>
      </aside>

      {/* Toggle en mobile */}
      <div className='lg:hidden p-4'>
        <button onClick={() => setOpen(true)}>
          <Menu className='text-gray-600' />
        </button>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  children,
  currentPath,
}: {
  href: string;
  children: React.ReactNode;
  currentPath: string;
}) {
  const isActive = currentPath === href;
  return (
    <Link
      href={href}
      className={`block px-2 py-1 rounded transition text-sm ${
        isActive
          ? 'bg-blue-100 text-blue-600 font-semibold'
          : 'hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );
}
