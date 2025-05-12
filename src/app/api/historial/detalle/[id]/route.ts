// app/api/historial/detalle/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const transaction = await prisma.inventoryTransaction.findUnique({
      where: { id },
      include: {
        item: {
          include: {
            type: true,
            unit: true,
          },
        },
        User: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      );
    }

    // Adaptamos al formato esperado por el modal
    const detailItem = {
      name: transaction.item.name,
      type: transaction.item.type.name,
      unit: transaction.item.unit.name,
      quantity: transaction.amount,
      price: transaction.price ?? undefined,
      total: transaction.price ? transaction.amount * transaction.price : undefined,
    };

    return NextResponse.json({
      data: {
        createdAt: transaction.createdAt,
        user: transaction.User?.name || 'Sistema',
        productos: [detailItem],
        totalGeneral: detailItem.total ?? null,
        type: transaction.type
      },
    });
  } catch (error) {
    console.error('Error obteniendo detalle de transacción:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}