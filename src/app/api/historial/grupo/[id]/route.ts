// app/api/historial/grupo/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const group = await prisma.inventoryTransactionGroup.findUnique({
      where: { id },
      include: {
        transactions: {
          include: {
            item: {
              include: {
                category: true,
                unit: true,
                subcategoryCode: true,
              },
            },
          },
        },
        user: true,
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: 'Grupo de transacciones no encontrado' },
        { status: 404 },
      );
    }

    const productos = group.transactions.map((t) => {
      // t.amount / t.price pueden ser Decimal o number -> los normalizamos a number
      const quantity = Number(t.amount ?? 0);
      const price = t.price != null ? Number(t.price) : undefined;
      const total = price != null ? quantity * price : undefined;

      return {
        name: t.item.name,
        type: t.item.category.name,
        unit: t.item.unit.name,
        code: t.item.subcategoryCode?.code ?? undefined,
        quantity, // number
        price, // number | undefined
        total, // number | undefined
      };
    });

    const totalGeneral = productos.reduce((sum, p) => sum + (p.total ?? 0), 0);

    return NextResponse.json({
      data: {
        createdAt: group.createdAt,
        user: group.user?.name || 'Sistema',
        productos,
        totalGeneral,
        type: group.transactions[0]?.type ?? 'DESCONOCIDO',
      },
    });
  } catch (error) {
    console.error('Error obteniendo detalle de grupo de transacción:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
