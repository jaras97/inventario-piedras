// src/app/api/inventario/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { hasWriteAccess } from '@/lib/auth/roles';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user || !hasWriteAccess(user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await context.params;
const { name, categoryId, price } = await req.json();

if (!name || !categoryId || price === null || price === undefined) {
  return NextResponse.json(
    { error: 'Datos incompletos para actualizar producto' },
    { status: 400 }
  );
}

const updated = await prisma.inventoryItem.update({
  where: { id },
  data: {
    name,
    categoryId, // <- usa categoryId directamente
    price,
  },
});

    await prisma.inventoryTransaction.create({
      data: {
        itemId: id,
        type: 'EDICION_PRODUCTO',
        amount: 0,
        price,
        userId: user.id,
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