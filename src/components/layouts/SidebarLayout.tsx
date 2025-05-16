'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';

export default function SidebarLayout() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role ?? '';

  const showHistorial = role === 'ADMIN' || role === 'AUDITOR';
  const showReportes = role === 'ADMIN' || role === 'AUDITOR';
  const showUsuarios = role === 'ADMIN';
  const showUnidades = role === 'ADMIN';

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className={`fixed inset-0 bg-[rgba(0,0,0,0.08)] z-40 transition-opacity duration-300 lg:hidden`}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-gray-50 text-gray-800 w-64 flex flex-col justify-between p-6 shadow-md z-50
        fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:relative lg:inset-auto lg:h-screen`}
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
            <SidebarLink href='/categorias' currentPath={pathname}>
              Categorias
            </SidebarLink>
          </nav>
        </div>

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
