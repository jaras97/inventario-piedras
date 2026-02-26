import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET: listar categorías con sus códigos
export async function GET() {
  const categorias = await prisma.inventoryCategory.findMany({
    include: {
      codes: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return NextResponse.json(categorias);
}

// POST: crear nueva categoría
export async function POST(req: Request) {
  const { name } = await req.json();

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 });
  }

  const categoria = await prisma.inventoryCategory.create({
    data: { name },
  });

  return NextResponse.json(categoria);
}