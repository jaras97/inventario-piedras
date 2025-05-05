import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { amount } = await req.json();

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Cantidad inválida' }, { status: 400 });
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
      type: 'SALIDA',
      amount,
    },
  });

  await prisma.inventoryItem.update({
    where: { id },
    data: {
      quantity: item.quantity - amount,
    },
  });

  return NextResponse.json({ success: true });
}