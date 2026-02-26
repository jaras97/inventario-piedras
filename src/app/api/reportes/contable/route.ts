import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import moment from 'moment-timezone';

export async function GET(req: NextRequest) {
  const TIMEZONE = 'America/Bogota';
  try {
    const { searchParams } = new URL(req.url);

    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const code = searchParams.get('code')?.toUpperCase();
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    if (!from || !to) {
      return NextResponse.json({ error: 'Fechas requeridas' }, { status: 400 });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const where: Prisma.InventoryTransactionWhereInput = {
      type: { in: ['VENTA_INDIVIDUAL', 'VENTA_GRUPAL'] },
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
      ...(code && {
        item: {
          subcategoryCode: {
            code: {
              equals: code,
              mode: 'insensitive',
            },
          },
        },
      }),
    };

    const [totalCount, ventas] = await Promise.all([
      prisma.inventoryTransaction.count({ where }),
      prisma.inventoryTransaction.findMany({
        where,
        include: {
          item: true,
          User: true,
          group: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const totalVentas = ventas.reduce((sum, v) => {
      const amountNum = Number(v.amount ?? 0);
      const priceNum = v.price != null ? Number(v.price) : 0;
      return sum + priceNum * amountNum;
    }, 0);

    const totalUnidades = ventas.reduce((sum, v) => {
      const amountNum = Number(v.amount ?? 0);
      return sum + amountNum;
    }, 0);

    const resumenPorMetodoPago: Record<string, number> = {};
    ventas.forEach((v) => {
      const metodo = v.group?.paymentMethod ?? 'N/A';
      const amountNum = Number(v.amount ?? 0);
      const priceNum = v.price != null ? Number(v.price) : 0;
      const total = priceNum * amountNum;
      if (!resumenPorMetodoPago[metodo]) resumenPorMetodoPago[metodo] = 0;
      resumenPorMetodoPago[metodo] += total;
    });

    return NextResponse.json({
      totalVentas,
      totalUnidades,
      transacciones: totalCount,
      resumenPorMetodoPago,
      data: ventas.map((v) => {
        const amountNum = Number(v.amount ?? 0);
        const priceNum = v.price != null ? Number(v.price) : 0;

        return {
          fecha: moment(v.createdAt).tz(TIMEZONE).format('YYYY-MM-DD HH:mm'),
          producto: v.item?.name ?? '',
          cantidad: amountNum,
          precioUnit: priceNum,
          total: amountNum * priceNum,
          usuario: v.User?.name ?? 'Sistema',
          metodoPago: v.group?.paymentMethod ?? 'N/A',
          cliente: v.group?.clientName ?? 'N/A',
          notas: v.group?.notes ?? '—',
        };
      }),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Error generando reporte contable' },
      { status: 500 },
    );
  }
}
