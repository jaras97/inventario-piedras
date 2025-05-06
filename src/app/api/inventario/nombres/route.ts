import prisma from '@/lib/db/prisma';
import { NextResponse } from 'next/server';


export async function GET() {
  try {
    const products = await prisma.inventoryItem.findMany({
      select: {
        name: true,
        type: {
          select: {
            name: true,
          },
        },
        unit: {
          select: {
            name: true,
          },
        },
      },
    });

    const mapped = products.map((item) => ({
      name: item.name,
      type: item.type.name,
      unit: item.unit.name,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error obteniendo nombres de productos:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}