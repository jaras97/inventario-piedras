import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { Prisma, TransactionType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const transactionType = searchParams.get('type') || undefined;
    const unit = searchParams.get('unit') || undefined;
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const user = searchParams.get('user') || undefined;
    const quantity = searchParams.get('quantity')
      ? parseFloat(searchParams.get('quantity')!)
      : undefined;

    const itemFilters: Prisma.InventoryItemWhereInput = {};
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
      ...(transactionType && {
        type: transactionType as TransactionType,
      }),
      ...(Object.keys(itemFilters).length > 0 && {
        item: { is: itemFilters },
      }),
      ...(dateFrom &&
        dateTo && {
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
      ...(quantity !== undefined && {
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

      const totalAmount = group.transactions.reduce(
        (sum, t) => sum + Number(t.amount ?? 0),
        0,
      );

      return {
        id: group.id,
        createdAt: group.createdAt,
        amount: totalAmount, // number
        type: first.type,
        itemName: `${group.transactions.length} productos`,
        user: group.user?.name || 'Sistema',
        isGrouped: true,
      };
    });

    const individualResults = individualTransactions.map((t) => ({
      id: t.id,
      createdAt: t.createdAt,
      amount: Number(t.amount ?? 0), // normalizamos a number
      type: t.type,
      price: t.price != null ? Number(t.price) : null, // number | null
      itemName:
        t.type === 'EDICION_PRODUCTO'
          ? `${t.item.name} (editado)`
          : t.item.name,
      user: t.User?.name || 'Sistema',
      isGrouped: false,
      transactionKind:
        t.type === 'EDICION_PRODUCTO'
          ? 'edit'
          : t.type.includes('VENTA')
            ? 'sell'
            : t.type === 'AJUSTE_NEGATIVO'
              ? 'adjust'
              : 'load',
    }));

    const all = [...groupResults, ...individualResults].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
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
