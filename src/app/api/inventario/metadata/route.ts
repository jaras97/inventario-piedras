import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET() {
  try {
    const [types, units] = await Promise.all([
      prisma.inventoryType.findMany({ select: { id: true, name: true } }),
      prisma.inventoryUnit.findMany({ select: { id: true, name: true , valueType: true} }),
    ]);

    return NextResponse.json({ types, units });
  } catch (error) {
    console.error('Error cargando metadata de inventario:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}