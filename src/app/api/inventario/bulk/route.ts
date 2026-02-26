import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { TransactionType } from '@prisma/client';
import { hasWriteAccess } from '@/lib/auth/roles';
import { roundToDecimals } from '@/lib/utils/round';

type ProductCSV = {
  name: string;
  category: string;
  unit: string;
  quantity: number;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    const role = session?.user?.role || '';

    if (!hasWriteAccess(role)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const raw: ProductCSV[] = await req.json();

    // Validar formato de entrada
    const validData = raw.filter(
      (item) =>
        item.name &&
        item.category &&
        item.unit &&
        !isNaN(Number(item.quantity)) &&
        Number(item.quantity) > 0,
    );

    if (validData.length === 0) {
      return NextResponse.json(
        { error: 'No hay productos válidos para cargar' },
        { status: 400 },
      );
    }

    const transactions = [];

    for (const item of validData) {
      const existing = await prisma.inventoryItem.findFirst({
        where: {
          name: item.name,
          category: { name: item.category },
          unit: { name: item.unit },
        },
      });

      if (existing) {
        const rawQuantity = Number(item.quantity);
        const quantity = roundToDecimals(rawQuantity, 3);

        await prisma.inventoryItem.update({
          where: { id: existing.id },
          data: {
            quantity: {
              increment: quantity,
            },
          },
        });

        transactions.push({
          itemId: existing.id,
          amount: quantity,
          type: TransactionType.CARGA_GRUPAL,
          userId: userId ?? null,
        });
      }
    }

    if (transactions.length > 0) {
      await prisma.inventoryTransactionGroup.create({
        data: {
          userId,
          transactions: {
            create: transactions,
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error en cargue grupal:', error);
    return NextResponse.json(
      { error: 'Error en el cargue grupal' },
      { status: 500 },
    );
  }
}
