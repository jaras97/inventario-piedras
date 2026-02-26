// src/app/api/inventario/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { hasWriteAccess } from '@/lib/auth/roles';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const item = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 },
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user || !hasWriteAccess(user.role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const { name, categoryId, price, subcategoryCodeId } = await req.json();

    if (!name || !categoryId || price === null || price === undefined) {
      return NextResponse.json(
        { error: 'Datos incompletos para actualizar producto' },
        { status: 400 },
      );
    }

    // Validación opcional para subcategoryCodeId si se usa
    if (
      subcategoryCodeId !== undefined &&
      subcategoryCodeId !== null &&
      typeof subcategoryCodeId !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Código de subcategoría inválido' },
        { status: 400 },
      );
    }

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: {
        name,
        categoryId,
        price,
        subcategoryCodeId: subcategoryCodeId ?? null,
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
      { status: 500 },
    );
  }
}
