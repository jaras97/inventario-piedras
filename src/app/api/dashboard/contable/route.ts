import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

type MonthlySalesRow = {
  month: Date;
  total: number;
};

export async function GET() {
  try {
    const now = new Date();

    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Ventas mensuales (últimos 6 meses)
const monthlySalesRaw = await prisma.$queryRaw<MonthlySalesRow[]>`
  SELECT DATE_TRUNC('month', "createdAt") AS month,
         SUM("amount" * "price") AS total
  FROM "InventoryTransaction"
  WHERE type IN ('VENTA_INDIVIDUAL', 'VENTA_GRUPAL')
  GROUP BY month
  ORDER BY month DESC
  LIMIT 6;
`;

    const monthlySales = monthlySalesRaw
      .map((m) => ({
        month: new Date(m.month).toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'short',
        }),
        total: Number(m.total),
      }))
      .reverse();

    // Productos más vendidos hoy
    const topToday = await prisma.inventoryTransaction.groupBy({
      by: ['itemId'],
      where: {
        type: { in: ['VENTA_INDIVIDUAL', 'VENTA_GRUPAL'] },
        createdAt: { gte: todayStart, lte: todayEnd },
      },
      _sum: { amount: true, price: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    });

    // Productos más vendidos este mes
    const topMonth = await prisma.inventoryTransaction.groupBy({
      by: ['itemId'],
      where: {
        type: { in: ['VENTA_INDIVIDUAL', 'VENTA_GRUPAL'] },
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true, price: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    });

    // Productos más vendidos históricamente
    const topAllTime = await prisma.inventoryTransaction.groupBy({
      by: ['itemId'],
      where: { type: { in: ['VENTA_INDIVIDUAL', 'VENTA_GRUPAL'] } },
      _sum: { amount: true, price: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    });

    // Obtener nombres de productos
    const itemIds = Array.from(
      new Set([...topToday, ...topMonth, ...topAllTime].map((t) => t.itemId))
    );

    const items = await prisma.inventoryItem.findMany({
      where: { id: { in: itemIds } },
    });

    const getLabel = (id: string) =>
      items.find((i) => i.id === id)?.name || 'Desconocido';

    return NextResponse.json({
  monthlySales,
  topToday: topToday.map((t) => {
    const amount = Number(t._sum.amount ?? 0);
    const price  = Number(t._sum.price ?? 0);

    return {
      name: getLabel(t.itemId),
      quantity: amount,
      total: amount * price,
    };
  }),
  topMonth: topMonth.map((t) => {
    const amount = Number(t._sum.amount ?? 0);
    const price  = Number(t._sum.price ?? 0);

    return {
      name: getLabel(t.itemId),
      quantity: amount,
      total: amount * price,
    };
  }),
  topAllTime: topAllTime.map((t) => {
    const amount = Number(t._sum.amount ?? 0);
    const price  = Number(t._sum.price ?? 0);

    return {
      name: getLabel(t.itemId),
      quantity: amount,
      total: amount * price,
    };
  }),
});

  } catch (error) {
    console.error('Error en /api/dashboard/contable:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}