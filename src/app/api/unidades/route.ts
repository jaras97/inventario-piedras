import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// POST /api/unidades
export async function POST(req: NextRequest) {
  const { name, valueType } = await req.json();

  if (!name || !valueType) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  try {
    const created = await prisma.inventoryUnit.create({
      data: { name, valueType },
    });

    return NextResponse.json({ data: created });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creando unidad' }, { status: 500 });
  }
}

// PUT /api/unidades
export async function PUT(req: NextRequest) {
  const { id, name, valueType } = await req.json();

  if (!id || !name || !valueType) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  try {
    const updated = await prisma.inventoryUnit.update({
      where: { id },
      data: { name, valueType },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error actualizando unidad' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const units = await prisma.inventoryUnit.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ data: units });
  } catch (error) {
    console.error('Error al obtener unidades:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}