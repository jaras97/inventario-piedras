import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [categories, units] = await Promise.all([
      prisma.inventoryCategory.findMany({
        select: {
          id: true,
          name: true,
          codes: { select: { id: true, code: true } },
        },
      }),
      prisma.inventoryUnit.findMany({
        select: { id: true, name: true, valueType: true },
      }),
    ]);

    return NextResponse.json({ categories, units });
  } catch (error) {
    console.error('Error cargando metadata de inventario:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
