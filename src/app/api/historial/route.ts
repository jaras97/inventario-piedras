// ✅ src/app/api/historial/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'

export async function GET() {
  try {
    const transactions = await prisma.inventoryTransaction.findMany({
      include: {
        item: true,
        User: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const formatted = transactions.map((tx) => ({
        id: tx.id,
        itemName: tx.item ? `${tx.item.name} (${tx.item.type})` : 'Desconocido',
        type: tx.type,
        amount: tx.amount,
        user: tx.User?.name || 'Desconocido',
        createdAt: tx.createdAt,
      }));

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error al obtener historial:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
