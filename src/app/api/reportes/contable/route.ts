import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from') ;
    const to = searchParams.get('to');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!from || !to) {
      return NextResponse.json({ error: 'Fechas requeridas' }, { status: 400 });
    }
 
    const fromDate =  new Date(from);

    const toDate =new Date(to);

    const where: Prisma.InventoryTransactionWhereInput = {
      type: { in: ['VENTA_INDIVIDUAL', 'VENTA_GRUPAL'] },
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
    };

    const [totalCount, ventas] = await Promise.all([
      prisma.inventoryTransaction.count({ where }),
      prisma.inventoryTransaction.findMany({
        where,
        include: {
          item: true,
          User: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const totalVentas = ventas.reduce((sum, v) => sum + (v.price ?? 0) * v.amount, 0);
    const totalUnidades = ventas.reduce((sum, v) => sum + v.amount, 0);

    return NextResponse.json({
      totalVentas,
      totalUnidades,
      transacciones: totalCount,
      data: ventas.map((v) => ({
        fecha: v.createdAt.toISOString().split('T')[0],
        producto: v.item?.name ?? '',
        cantidad: v.amount,
        precioUnit: v.price ?? 0,
        total: v.amount * (v.price ?? 0),
        usuario: v.User?.name ?? 'Sistema',
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Error generando reporte contable' },
      { status: 500 }
    );
  }
}