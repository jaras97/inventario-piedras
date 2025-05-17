// /app/(admin)/categorias/page.tsx

import { CategoryForm } from '@/components/components/CategoryForm';
import { CategoryList } from '@/components/components/CategoryList';
import { checkRole } from '@/lib/auth/checkRole';
import { ROLES } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';

export default async function CategoriasPage() {
  const hasAccess = await checkRole([ROLES.ADMIN]); // 👈 SOLO ADMIN

  if (!hasAccess) {
    return redirect('/dashboard');
  }
  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Gestión de Categorías</h1>
      <CategoryForm /> {/* Formulario para crear categoría */}
      <CategoryList /> {/* Lista de categorías + subcódigos */}
    </div>
  );
}
