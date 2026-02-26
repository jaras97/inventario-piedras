import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';



export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
   const { code } = await req.json();

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Código inválido' }, { status: 400 });
  }

  // Validar existencia de categoría
  const categoria = await prisma.inventoryCategory.findUnique({
    where: { id },
  });

  if (!categoria) {
    return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
  }

  // Validar código único dentro de la categoría
  const existe = await prisma.inventorySubcategoryCode.findFirst({
    where: {
      code,
      categoryId: id,
    },
  });

  if (existe) {
    return NextResponse.json({ error: 'Este código ya existe en la categoría' }, { status: 409 });
  }

  // Crear el código
  const nuevoCodigo = await prisma.inventorySubcategoryCode.create({
    data: {
      code,
      categoryId: id,
    },
  });

  return NextResponse.json(nuevoCodigo);
}