import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email ?? 'sistema';

     const { id } = await context.params;
    const { name, typeId, price } = await req.json();

    if (!name || !typeId || price == null) {
      return NextResponse.json(
        { error: 'Datos incompletos para actualizar producto' },
        { status: 400 }
      );
    }

    // Actualizar producto
    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: {
        name,
        typeId,
        price,
      },
    });

    // Obtener ID del usuario (si está logueado)
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    // Registrar transacción tipo EDICION_PRODUCTO
    await prisma.inventoryTransaction.create({
      data: {
        itemId: id,
        type: 'EDICION_PRODUCTO',
        amount: 0,
        price,
        userId: user?.id ?? null,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    );
  }
}