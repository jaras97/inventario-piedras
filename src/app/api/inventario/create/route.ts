import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

export async function POST(req: NextRequest) {
  try {
    const { name, typeId, unitId, quantity } = await req.json();

    if (!name || !typeId || !unitId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Validar que el typeId y unitId existan
    const [typeExists, unitExists] = await Promise.all([
      prisma.inventoryType.findUnique({ where: { id: typeId } }),
      prisma.inventoryUnit.findUnique({ where: { id: unitId } }),
    ]);

    if (!typeExists || !unitExists) {
      return NextResponse.json(
        { error: 'Tipo o unidad inválida' },
        { status: 400 }
      );
    }

    // Crear el producto
    const newItem = await prisma.inventoryItem.create({
      data: {
        name,
        typeId,
        unitId,
        quantity,
      },
    });

    // Si la cantidad es mayor que 0, registrar transacción
    if (quantity > 0) {
      const session = await getServerSession(authOptions);
      await prisma.inventoryTransaction.create({
        data: {
          itemId: newItem.id,
          type: 'ENTRADA',
          amount: quantity,
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