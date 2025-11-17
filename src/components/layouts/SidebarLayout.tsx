'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

export default function SidebarLayout() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role ?? '';

  const showHistorial = role === 'ADMIN' || role === 'AUDITOR';
  const showReportes = role === 'ADMIN' || role === 'AUDITOR';
  const showUsuarios = role === 'ADMIN';
  const showUnidades = role === 'ADMIN';
  const showCategories = role === 'ADMIN';

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className='fixed inset-0 bg-[rgba(0,0,0,0.08)] z-40 transition-opacity duration-300 lg:hidden'
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-blue-900 text-gray-800 w-64 flex flex-col justify-between p-6 shadow-md
          fixed inset-y-0 left-0 z-50
          h-screen overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div>
          <div className='flex items-center justify-center mb-6 px-4 py-6 border-b border-gray-200/40'>
            <Image
              src='/logo.svg'
              alt='Metales y Brillantes'
              width={140}
              height={80}
              className='object-contain'
              priority
            />
          </div>
          <nav className='flex flex-col gap-3'>
            <SidebarLink href='/dashboard' currentPath={pathname}>
              Dashboard
            </SidebarLink>
            <SidebarLink href='/inventario' currentPath={pathname}>
              Inventario
            </SidebarLink>
            {showHistorial && (
              <SidebarLink href='/historial' currentPath={pathname}>
                Historial
              </SidebarLink>
            )}
            {showReportes && (
              <SidebarLink href='/reportes' currentPath={pathname}>
                Reportes
              </SidebarLink>
            )}
            {showUsuarios && (
              <SidebarLink href='/usuarios' currentPath={pathname}>
                Usuarios
              </SidebarLink>
            )}
            {showUnidades && (
              <SidebarLink href='/unidades' currentPath={pathname}>
                Unidades
              </SidebarLink>
            )}
            {showCategories && (
              <SidebarLink href='/categorias' currentPath={pathname}>
                Categorias
              </SidebarLink>
            )}
          </nav>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className='flex items-center gap-2 text-sm text-gray-200/80 hover:text-red-400 transition mt-6'
        >
          <LogOut className='w-4 h-4' />
          Cerrar sesión
        </button>

        {/* Botón cerrar en mobile */}
        <button
          className='absolute top-4 right-4 block lg:hidden'
          onClick={() => setOpen(false)}
        >
          <X className='text-gray-200' />
        </button>
      </aside>

      {/* Botón hamburguesa */}
      <button
        onClick={() => setOpen(true)}
        className={`lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow-md transition-all duration-300 ease-in-out transform ${
          open
            ? 'opacity-0 scale-95 pointer-events-none'
            : 'opacity-100 scale-100'
        }`}
      >
        <Menu className='text-gray-600' />
      </button>
    </>
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
      className={`block px-3 py-2 rounded-md transition text-sm font-medium ${
        isActive
          ? 'bg-blue-700 text-white shadow-sm'
          : 'text-white/80 hover:bg-blue-800 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
}
