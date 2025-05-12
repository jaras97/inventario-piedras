// src/app/api/inventario/bulk/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { TransactionType } from '@prisma/client';

type ProductCSV = {
  name: string;
  type: string;
  unit: string;
  quantity: number;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    const raw: ProductCSV[] = await req.json();

    const validData = raw.filter(
      (item) =>
        item.name && item.type && item.unit && !isNaN(Number(item.quantity))
    );

    const transactions = [];

    for (const item of validData) {
      const existing = await prisma.inventoryItem.findFirst({
        where: {
          name: item.name,
          type: { name: item.type },
          unit: { name: item.unit },
        },
      });

      if (existing) {
        const quantity = Number(item.quantity);

        await prisma.inventoryItem.update({
          where: { id: existing.id },
          data: {
            quantity: {
              increment: quantity,
            },
          },
        });

        transactions.push({
          item: { connect: { id: existing.id } },
          amount: quantity,
          type: TransactionType.CARGA_GRUPAL,
          User: userId ? { connect: { id: userId } } : undefined, 
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
    console.error('Error en cargue grupal:', error);
    return NextResponse.json({ error: 'Error en el cargue grupal' }, { status: 500 });
  }
}