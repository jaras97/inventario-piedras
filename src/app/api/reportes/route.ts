// app/api/reportes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
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
      ...(transactionType && transactionType !== 'Todas' && {
        type: transactionType as TransactionType,
      }),
      ...(from && to && {
        createdAt: {
          gte: new Date(from),
          lte: new Date(to),
        },
      }),
      ...(product && product !== 'todos' && {
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

    const totalVentas = await prisma.inventoryTransaction.aggregate({
      where,
      _sum: {
        price: true,
      },
    });

    const totalUnidades = await prisma.inventoryTransaction.aggregate({
      where,
      _sum: {
        amount: true,
      },
    });

    const data = transactions.map((tx) => ({
      fecha: tx.createdAt.toISOString().split('T')[0],
      producto: tx.item?.name ?? '',
      cantidad: tx.amount,
      precioUnit: tx.price ?? 0,
      total: tx.amount * (tx.price ?? 0),
      usuario: tx.User?.name ?? 'Sistema',
    }));

    return NextResponse.json({
      data,
      totalItems: totalCount,
      totalVentas: totalVentas._sum.price || 0,
      totalUnidades: totalUnidades._sum.amount || 0,
    });
  } catch (error) {
    console.error('Error al generar reporte paginado:', error);
    return NextResponse.json({ error: 'Error generando el reporte' }, { status: 500 });
  }
}
