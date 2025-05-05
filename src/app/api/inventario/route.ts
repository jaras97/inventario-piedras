import { NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'

export async function GET() {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error al obtener inventario:', error)

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}