import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filtros opcionales
    const name = searchParams.get('name') || undefined;
    const type = searchParams.get('type') || undefined;
    const unit = searchParams.get('unit') || undefined;
    const quantity = searchParams.get('quantity')
      ? parseFloat(searchParams.get('quantity')!)
      : undefined;

      const where: Prisma.InventoryItemWhereInput = {
        ...(name && {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        }),
        ...(type && {
          type: {
            is: {
              name: {
                equals: type,
                mode: 'insensitive',
              },
            },
          },
        }),
        ...(unit && {
          unit: {
            is: {
              name: {
                equals: unit,
                mode: 'insensitive',
              },
            },
          },
        }),
        ...(quantity && {
          quantity: {
            gte: quantity,
          },
        }),
      };

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          type: true,
          unit: true,
        },
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    return NextResponse.json({
data: items.map((item) => ({
  id: item.id,
  name: item.name,
  typeId: item.typeId, 
  type: { name: item.type?.name ?? '' },
    unit: {
    id: item.unit?.id ?? '',
    name: item.unit?.name ?? '',
    valueType: item.unit?.valueType ?? 'DECIMAL',
  },
  quantity: item.quantity,
  price: item.price,
})),
      total,
      page,
      pageSize: limit,
    });
  } catch (error) {
    console.error('Error al obtener inventario paginado:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}