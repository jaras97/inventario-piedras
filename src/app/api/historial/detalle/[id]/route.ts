import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const transaction = await prisma.inventoryTransaction.findUnique({
      where: { id },
      include: {
        item: {
          include: {
            category: true,
            unit: true,
            subcategoryCode: true,
          },
        },
        User: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 },
      );
    }

    const amountDecimal = new Prisma.Decimal(transaction.amount ?? 0); // en schema es NOT NULL, pero por si acaso
    const priceDecimal =
      transaction.price == null ? null : new Prisma.Decimal(transaction.price); // puede ser null

    const quantity = amountDecimal.toNumber();
    const price = priceDecimal?.toNumber();
    const total = priceDecimal
      ? amountDecimal.mul(priceDecimal).toNumber()
      : undefined;

    const detailItem = {
      name: transaction.item.name,
      type: transaction.item.category.name,
      unit: transaction.item.unit.name,
      code: transaction.item.subcategoryCode?.code ?? undefined,
      quantity, // number
      price, // number | undefined
      total, // number | undefined
    };

    return NextResponse.json({
      data: {
        createdAt: transaction.createdAt,
        user: transaction.User?.name || 'Sistema',
        productos: [detailItem],
        totalGeneral: total ?? null,
        type: transaction.type,
      },
    });
  } catch (error) {
    console.error('Error obteniendo detalle de transacción:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
