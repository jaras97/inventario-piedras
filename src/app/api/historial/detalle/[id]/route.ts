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
        { status: 404 }
      );
    }

    
    const detailItem = {
      name: transaction.item.name,
      type: transaction.item.category.name, 
      unit: transaction.item.unit.name,
      code: transaction.item.subcategoryCode?.code ?? undefined, 
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
        type: transaction.type,
      },
    });
  } catch (error) {
    console.error('Error obteniendo detalle de transacción:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}