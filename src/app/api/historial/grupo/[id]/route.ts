// app/api/historial/grupo/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const group = await prisma.inventoryTransactionGroup.findUnique({
      where: { id },
      include: {
        transactions: {
          include: {
            item: {
              include: {
                type: true,
                unit: true,
              },
            },
          },
        },
        user: true,
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Grupo de transacciones no encontrado' },
        { status: 404 }
      );
    }

    const productos = group.transactions.map((t) => ({
      name: t.item.name,
      type: t.item.type.name,
      unit: t.item.unit.name,
      quantity: t.amount,
      price: t.price ?? undefined,
      total: t.price ? t.amount * t.price : undefined,
    }));

    const totalGeneral = productos.reduce((sum, p) => sum + (p.total ?? 0), 0);

    return NextResponse.json({
      data: {
        createdAt: group.createdAt,
        user: group.user?.name || 'Sistema',
        productos,
        totalGeneral,
        type: group.transactions[0].type
      
      },
    });
  } catch (error) {
    console.error('Error obteniendo detalle de grupo de transacción:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}