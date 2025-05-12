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

    const [groups, individualTransactions] = await Promise.all([
      prisma.inventoryTransactionGroup.findMany({
        where: {
          transactions: {
            some: where,
          },
        },
        include: {
          user: true,
          transactions: {
            include: {
              item: true,
            },
          },
        },
      }),
      prisma.inventoryTransaction.findMany({
        where: {
          ...where,
          groupId: null,
        },
        include: {
          item: true,
          User: true,
        },
      }),
    ]);

    const groupResults = groups.map((group) => {
      const first = group.transactions[0];
      return {
        id: group.id,
        createdAt: group.createdAt,
        amount: group.transactions.reduce((sum, t) => sum + t.amount, 0),
        type: first.type,
        itemName: `${group.transactions.length} productos`,
        user: group.user?.name || 'Sistema',
        isGrouped: true,
      };
    });

const individualResults = individualTransactions.map((t) => ({
  id: t.id,
  createdAt: t.createdAt,
  amount: t.amount,
  type: t.type,
  price: t.price,
  itemName:
    t.type === 'EDICION_PRODUCTO' ? `${t.item.name} (editado)` : t.item.name,
  user: t.User?.name || 'Sistema',
  isGrouped: false,
  transactionKind:
    t.type === 'EDICION_PRODUCTO'
      ? 'edit'
      : t.type.includes('VENTA')
      ? 'sell'
      : 'load',
}));

    const all = [...groupResults, ...individualResults].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const paginated = all.slice(skip, skip + limit);

    return NextResponse.json({
      data: paginated,
      total: all.length,
      page,
      pageSize: limit,
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}