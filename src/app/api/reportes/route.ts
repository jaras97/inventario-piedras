// app/api/reportes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, TransactionType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const product = searchParams.get('product')?.toLowerCase();
    const transactionType = searchParams.get('transactionType');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    const where: Prisma.InventoryTransactionWhereInput = {
      ...(transactionType &&
        transactionType !== 'Todas' && {
          type: transactionType as TransactionType,
        }),
      ...(from &&
        to && {
          createdAt: {
            gte: new Date(from),
            lte: new Date(to),
          },
        }),
      ...(product &&
        product !== 'todos' && {
          item: {
            name: {
              contains: product,
              mode: 'insensitive',
            },
          },
        }),
    };

    const [transactions, totalCount] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where,
        skip: offset,
        take: limit,
        include: {
          item: true,
          User: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.inventoryTransaction.count({ where }),
    ]);

    const totalVentasAgg = await prisma.inventoryTransaction.aggregate({
      where,
      _sum: {
        price: true,
      },
    });

    const totalUnidadesAgg = await prisma.inventoryTransaction.aggregate({
      where,
      _sum: {
        amount: true,
      },
    });

    const data = transactions.map((tx) => {
      const cantidad = Number(tx.amount ?? 0);
      const precioUnit = tx.price != null ? Number(tx.price) : 0;

      return {
        fecha: tx.createdAt.toISOString().split('T')[0],
        producto: tx.item?.name ?? '',
        cantidad,
        precioUnit,
        total: cantidad * precioUnit,
        usuario: tx.User?.name ?? 'Sistema',
      };
    });

    const totalVentasNumber =
      totalVentasAgg._sum.price != null ? Number(totalVentasAgg._sum.price) : 0;

    const totalUnidadesNumber =
      totalUnidadesAgg._sum.amount != null
        ? Number(totalUnidadesAgg._sum.amount)
        : 0;

    return NextResponse.json({
      data,
      totalItems: totalCount,
      totalVentas: totalVentasNumber,
      totalUnidades: totalUnidadesNumber,
    });
  } catch (error) {
    console.error('Error al generar reporte paginado:', error);
    return NextResponse.json(
      { error: 'Error generando el reporte' },
      { status: 500 },
    );
  }
}
