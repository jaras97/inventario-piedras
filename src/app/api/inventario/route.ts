import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { roundToDecimals } from '@/lib/utils/round';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const name = searchParams.get('name') || undefined;
    const category = searchParams.get('category') || undefined;
    const unit = searchParams.get('unit') || undefined;
    const code = searchParams.get('code') || undefined;

    const quantityRaw = searchParams.get('quantity');
    const quantity = quantityRaw
      ? roundToDecimals(parseFloat(quantityRaw), 3)
      : undefined;

    const where: Prisma.InventoryItemWhereInput = {
      ...(name && {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      }),
      ...(category && {
        categoryId: category,
      }),
      ...(code && {
        subcategoryCode: {
          is: {
            code: {
              equals: code,
              mode: 'insensitive',
            },
          },
        },
      }),
      ...(unit && {
        unitId: unit,
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
          category: true,
          unit: true,
          subcategoryCode: true,
        },
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    return NextResponse.json({
      data: items.map((item) => ({
        id: item.id,
        name: item.name,
        categoryId: item.categoryId,
        category: {
          id: item.category?.id ?? '',
          name: item.category?.name ?? '',
        },
        unit: {
          id: item.unit?.id ?? '',
          name: item.unit?.name ?? '',
          valueType: item.unit?.valueType ?? 'DECIMAL',
        },
        subcategoryCode: item.subcategoryCode
          ? { id: item.subcategoryCode.id, code: item.subcategoryCode.code }
          : null,
        // 👇 aquí convertimos Decimal -> number antes de redondear
        quantity: roundToDecimals(Number(item.quantity), 3),
        price: roundToDecimals(Number(item.price), 3),
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
