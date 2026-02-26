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

    // ===============================
    // 🔵 VENTAS MENSUALES (CORRECTO)
    // ===============================
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

    // ===============================
    // 🔵 TOP HISTÓRICO (CORRECTO)
    // ===============================
    const topAllTime = await prisma.$queryRaw<
      { itemId: string; quantity: number; total: number }[]
    >`
      SELECT 
        "itemId",
        SUM("amount") as quantity,
        SUM("amount" * "price") as total
      FROM "InventoryTransaction"
      WHERE type IN ('VENTA_INDIVIDUAL', 'VENTA_GRUPAL')
      GROUP BY "itemId"
      ORDER BY quantity DESC
      LIMIT 5;
    `;

    // ===============================
    // 🔵 TOP MES (CORRECTO)
    // ===============================
    const topMonth = await prisma.$queryRaw<
      { itemId: string; quantity: number; total: number }[]
    >`
      SELECT 
        "itemId",
        SUM("amount") as quantity,
        SUM("amount" * "price") as total
      FROM "InventoryTransaction"
      WHERE type IN ('VENTA_INDIVIDUAL', 'VENTA_GRUPAL')
      AND "createdAt" BETWEEN ${monthStart} AND ${monthEnd}
      GROUP BY "itemId"
      ORDER BY quantity DESC
      LIMIT 5;
    `;

    // ===============================
    // 🔵 TOP HOY (CORRECTO)
    // ===============================
    const topToday = await prisma.$queryRaw<
      { itemId: string; quantity: number; total: number }[]
    >`
      SELECT 
        "itemId",
        SUM("amount") as quantity,
        SUM("amount" * "price") as total
      FROM "InventoryTransaction"
      WHERE type IN ('VENTA_INDIVIDUAL', 'VENTA_GRUPAL')
      AND "createdAt" BETWEEN ${todayStart} AND ${todayEnd}
      GROUP BY "itemId"
      ORDER BY quantity DESC
      LIMIT 5;
    `;

    // ===============================
    // 🔵 INGRESOS TOTALES REALES
    // ===============================
    const totalRevenueRaw = await prisma.$queryRaw<{ total: number }[]>`
      SELECT SUM("amount" * "price") as total
      FROM "InventoryTransaction"
      WHERE type IN ('VENTA_INDIVIDUAL', 'VENTA_GRUPAL');
    `;

    const totalRevenue = Number(totalRevenueRaw[0]?.total ?? 0);

    // ===============================
    // 🔵 TOTAL TRANSACCIONES REALES
    // ===============================
    const totalTransactions = await prisma.inventoryTransaction.count({
      where: {
        type: { in: ['VENTA_INDIVIDUAL', 'VENTA_GRUPAL'] },
      },
    });

    // ===============================
    // 🔵 OBTENER NOMBRES DE PRODUCTOS
    // ===============================
    const itemIds = Array.from(
      new Set([...topToday, ...topMonth, ...topAllTime].map((t) => t.itemId)),
    );

    const items = await prisma.inventoryItem.findMany({
      where: { id: { in: itemIds } },
    });

    const getLabel = (id: string) =>
      items.find((i) => i.id === id)?.name || 'Desconocido';

    return NextResponse.json({
      monthlySales,
      topToday: topToday.map((t) => ({
        name: getLabel(t.itemId),
        quantity: Number(t.quantity),
        total: Number(t.total),
      })),
      topMonth: topMonth.map((t) => ({
        name: getLabel(t.itemId),
        quantity: Number(t.quantity),
        total: Number(t.total),
      })),
      topAllTime: topAllTime.map((t) => ({
        name: getLabel(t.itemId),
        quantity: Number(t.quantity),
        total: Number(t.total),
      })),
      totalRevenue,
      totalTransactions,
    });
  } catch (error) {
    console.error('Error en /api/dashboard/contable:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}
