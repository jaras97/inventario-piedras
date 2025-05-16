import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { ROLES } from '@/lib/auth/roles';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Cantidad inválida' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);

    if (session?.user?.role === ROLES.AUDITOR || session?.user?.role === ROLES.USER ) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 });
    }

    await prisma.inventoryTransaction.create({
      data: {
        itemId: id,
        type: 'CARGA_INDIVIDUAL',
        amount,
        price: item.price,
        userId: session?.user?.id || null,
      },
    });

    await prisma.inventoryItem.update({
      where: { id },
      data: { quantity: item.quantity + amount },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cargando inventario:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}