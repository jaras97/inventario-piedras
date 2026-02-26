import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { itemId, amount, reason } = await req.json();

    if (!itemId || !amount || amount <= 0 || !reason) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 },
      );
    }

    if (Number(item.quantity) < amount) {
      return NextResponse.json(
        { error: 'Cantidad supera el stock actual' },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1️⃣ Descontar cantidad
      await tx.inventoryItem.update({
        where: { id: itemId },
        data: {
          quantity: {
            decrement: amount,
          },
        },
      });

      // 2️⃣ Registrar movimiento
      await tx.inventoryTransaction.create({
        data: {
          itemId,
          type: 'AJUSTE_NEGATIVO',
          amount,
          userId: session.user.id,
          notes: reason,
        },
      });

      // 3️⃣ Si queda en 0 → marcar inactivo
      const updated = await tx.inventoryItem.findUnique({
        where: { id: itemId },
      });

      if (Number(updated!.quantity) === 0) {
        await tx.inventoryItem.update({
          where: { id: itemId },
          data: {
            isActive: false,
            deletedAt: new Date(),
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error ajuste inventario:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
