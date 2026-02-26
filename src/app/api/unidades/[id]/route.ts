import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const unit = await prisma.inventoryUnit.findUnique({
      where: { id },
      select: { valueType: true },
    });

    if (!unit) {
      return NextResponse.json(
        { error: 'Unidad no encontrada' },
        { status: 404 },
      );
    }

    return NextResponse.json(unit);
  } catch (error) {
    console.error('Error obteniendo detalle de unidades:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
