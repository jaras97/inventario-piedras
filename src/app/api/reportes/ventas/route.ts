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

    const data = transactions.map((tx) => {
      const cantidad = Number(tx.amount ?? 0);
      const precioUnitario = tx.price != null ? Number(tx.price) : 0;

      return {
        fecha: tx.createdAt,
        producto: tx.item.name,
        unidad: tx.item.unit.name,
        cantidad,
        precioUnitario,
        total: precioUnitario * cantidad,
        usuario: tx.User?.name || 'Sistema',
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error en reporte de ventas:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
