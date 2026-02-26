import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { ROLES } from '@/lib/auth/roles';

export async function POST(req: NextRequest) {
   const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== ROLES.ADMIN) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  try {
    const { name, categoryId, unitId, subcategoryCodeId, quantity, price } = await req.json();

    if (!name || !categoryId || !unitId || quantity === undefined || price === undefined) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const [categoryExists, unitExists] = await Promise.all([
      prisma.inventoryCategory.findUnique({ where: { id: categoryId } }),
      prisma.inventoryUnit.findUnique({ where: { id: unitId } }),
    ]);

    if (!categoryExists || !unitExists) {
      return NextResponse.json({ error: 'Categoría o unidad inválida' }, { status: 400 });
    }

    const newItem = await prisma.inventoryItem.create({
      data: {
        name,
        categoryId,
        unitId,
        subcategoryCodeId: subcategoryCodeId || undefined,
        quantity,
        price,
      },
    });

    if (quantity > 0) {
      const session = await getServerSession(authOptions);
      await prisma.inventoryTransaction.create({
        data: {
          itemId: newItem.id,
          type: 'CARGA_INDIVIDUAL',
          amount: quantity,
          price,
          userId: session?.user?.id || null,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creando producto:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}