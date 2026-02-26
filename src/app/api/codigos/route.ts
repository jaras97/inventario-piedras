import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('categoryId');

  if (!categoryId) {
    return NextResponse.json({ error: 'Falta categoryId' }, { status: 400 });
  }

  const codes = await prisma.inventorySubcategoryCode.findMany({
    where: { categoryId },
    orderBy: { code: 'asc' },
  });

  return NextResponse.json(codes);
}