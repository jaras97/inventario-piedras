import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { TransactionType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    if (!dateFrom || !dateTo) {
      return NextResponse.json(
        { error: 'Rango de fechas requerido' },
        { status: 400 }
      );
    }

    const transactions = await prisma.inventoryTransaction.findMany({
      where: {
        type: { in: [TransactionType.VENTA_INDIVIDUAL, TransactionType.VENTA_GRUPAL] },
        createdAt: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo),
        },
      },
      include: {
        item: {
          include: {
            unit: true,
          },
        },
        User: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const data = transactions.map((tx) => ({
      fecha: tx.createdAt,
      producto: tx.item.name,
      unidad: tx.item.unit.name,
      cantidad: tx.amount,
      precioUnitario: tx.price ?? 0,
      total: (tx.price ?? 0) * tx.amount,
      usuario: tx.User?.name || 'Sistema',
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error en reporte de ventas:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}