import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { hasWriteAccess } from '@/lib/auth/roles';
import { TransactionType } from '@prisma/client';
import { roundToDecimals } from '@/lib/utils/round';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { amount, price } = await req.json();

    if (!amount || amount <= 0 || !price || price <= 0) {
      return NextResponse.json(
        { error: 'Cantidad o precio inválido' },
        { status: 400 }
      );
    }

    const roundedAmount = roundToDecimals(amount, 3);
const roundedPrice = roundToDecimals(price, 3);

    const item = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 });
    }

    if (item.quantity < amount) {
      return NextResponse.json(
        { error: 'No hay suficiente cantidad en inventario' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const role = session?.user?.role || '';

    if (!hasWriteAccess(role)) {
      return NextResponse.json(
        { error: 'No autorizado para realizar ventas' },
        { status: 403 }
      );
    }

    await prisma.inventoryTransaction.create({
      data: {
        itemId: id,
        type: TransactionType.VENTA_INDIVIDUAL,
        amount:roundedAmount,
        price:roundedPrice,
        userId: session?.user.id,
      },
    });

    await prisma.inventoryItem.update({
      where: { id },
      data: {
        quantity: {
          decrement: roundedAmount,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al registrar venta individual:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}