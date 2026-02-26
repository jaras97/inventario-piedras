import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import prisma from '@/lib/db/prisma';
import { hasWriteAccess } from '@/lib/auth/roles';
import { TransactionType, PaymentMethod } from '@prisma/client';

type GroupSellItem = {
  itemId: string;
  amount: number;
  price: number;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !hasWriteAccess(session.user.role)) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const { items, paymentMethod, clientName, notes } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'No hay productos' }, { status: 400 });
    }

    if (!paymentMethod || typeof paymentMethod !== 'string') {
      return NextResponse.json({ message: 'Método de pago requerido' }, { status: 400 });
    }

    const userId = session.user.id;

    const group = await prisma.inventoryTransactionGroup.create({
      data: {
        userId,
        paymentMethod: paymentMethod as PaymentMethod,
        clientName: clientName ?? null,
        notes: notes ?? null,
        transactions: {
          create: await Promise.all(
            items.map(async (item: GroupSellItem) => {
              const inventoryItem = await prisma.inventoryItem.findUnique({
                where: { id: item.itemId },
              });

              // 👇 Aquí el cambio: Decimal -> number para la comparación
              if (
                !inventoryItem ||
                Number(inventoryItem.quantity) < item.amount
              ) {
                throw new Error(
                  `Producto insuficiente o inexistente: ${item.itemId}`
                );
              }

              await prisma.inventoryItem.update({
                where: { id: item.itemId },
                data: {
                  quantity: {
                    decrement: item.amount,
                  },
                },
              });

              return {
                itemId: item.itemId,
                amount: item.amount,
                price: item.price,
                type: TransactionType.VENTA_GRUPAL,
                userId,
              };
            })
          ),
        },
      },
    });

    return NextResponse.json({ success: true, groupId: group.id });
  } catch (error) {
    console.error('Error en venta grupal:', error);
    return NextResponse.json(
      { message: 'Error procesando venta grupal' },
      { status: 500 }
    );
  }
}
