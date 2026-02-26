import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET() {
  try {
    const products = await prisma.inventoryItem.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        quantity: true, 
        unit: {
          select: {
            name: true,
            valueType: true,
          },
        },
        category: {
          select: { name: true },
        },
      },
    });

    const mapped = products.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category.name,
      unit: item.unit.name,
      valueType: item.unit.valueType,
      price: item.price,
      quantity: item.quantity, 
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('[API] Error cargando nombres de productos:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}