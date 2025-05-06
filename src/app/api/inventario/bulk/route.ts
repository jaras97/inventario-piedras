// src/app/api/inventario/bulk/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

type ProductCSV = {
  name: string;
  type: string;
  unit: string;
  quantity: number;
};

export async function POST(req: Request) {
  try {
    const raw: ProductCSV[] = await req.json();

    const validData = raw.filter(
      (item) =>
        item.name && item.type && item.unit && !isNaN(Number(item.quantity))
    );

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

        if (!isNaN(quantity)) {
          await prisma.inventoryItem.update({
            where: { id: existing.id },
            data: {
              quantity: {
                increment: quantity, 
              },
            },
          });
        }

        await prisma.inventoryTransaction.create({
            data: {
              itemId: existing.id,
              type: 'ENTRADA',
              amount: Number(item.quantity), 
            },
          });
      }
  
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en cargue grupal:', error);
    return NextResponse.json({ error: 'Error en el cargue grupal' }, { status: 500 });
  }
}