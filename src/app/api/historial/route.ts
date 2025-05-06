import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const name = searchParams.get('name') || undefined;
    const type = searchParams.get('type') || undefined;
    const unit = searchParams.get('unit') || undefined;
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const user = searchParams.get('user') || undefined;
    const quantity = searchParams.get('quantity')
      ? parseFloat(searchParams.get('quantity')!)
      : undefined;

    // Filtros relacionados con el item
    const itemFilters: Prisma.InventoryItemWhereInput = {};
    if (name) {
      itemFilters.name = { contains: name, mode: 'insensitive' };
    }
    if (type) {
      itemFilters.type = {
        is: {
          name: {
            equals: type,
            mode: 'insensitive',
          },
        },
      };
    }
    if (unit) {
      itemFilters.unit = {
        is: {
          name: {
            equals: unit,
            mode: 'insensitive',
          },
        },
      };
    }

    const where: Prisma.InventoryTransactionWhereInput = {
      ...(Object.keys(itemFilters).length > 0 && {
        item: { is: itemFilters },
      }),
      ...(dateFrom && dateTo && {
        createdAt: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo),
        },
      }),
      ...(user && {
        User: {
          name: {
            contains: user,
            mode: 'insensitive',
          },
        },
      }),
      ...(quantity && {
        amount: {
          gte: quantity,
        },
      }),
    };

    const [transactions, total] = await Promise.all([
      prisma.inventoryTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          item: {
            include: {
              type: true,
              unit: true,
            },
          },
          User: true,
        },
      }),
      prisma.inventoryTransaction.count({ where }),
    ]);

    const result = transactions.map((t) => ({
      id: t.id,
      createdAt: t.createdAt,
      amount: t.amount,
      type: t.type,
      itemName: t.item.name,
      user: t.User?.name || 'Sistema',
    }));

    return NextResponse.json({
      data: result,
      total,
      page,
      pageSize: limit,
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}