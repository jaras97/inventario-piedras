// ✅ src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { subDays, format } from 'date-fns'

export async function GET() {
  try {
    // Totales generales
    const [totalItems, oro, esmeralda, diamante] = await Promise.all([
      prisma.inventoryItem.count(),
      prisma.inventoryItem.aggregate({
        _sum: { quantity: true },
        where: { type: 'oro' },
      }),
      prisma.inventoryItem.aggregate({
        _sum: { quantity: true },
        where: { type: 'esmeralda' },
      }),
      prisma.inventoryItem.aggregate({
        _sum: { quantity: true },
        where: { type: 'diamante' },
      }),
    ])

    // Últimos movimientos
    const recent = await prisma.inventoryTransaction.findMany({
      include: { item: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
    })

    // Movimientos por día (últimos 7 días)
    const since = subDays(new Date(), 7)
    const raw = await prisma.inventoryTransaction.findMany({
      where: { createdAt: { gte: since } },
    })

    const chartMap: Record<string, { entradas: number; salidas: number }> = {}

    for (let i = 0; i < 7; i++) {
      const date = format(subDays(new Date(), i), 'dd/MM')
      chartMap[date] = { entradas: 0, salidas: 0 }
    }

    for (const tx of raw) {
      const date = format(tx.createdAt, 'dd/MM')
      if (!chartMap[date]) continue
      if (tx.type === 'ENTRADA') chartMap[date].entradas += tx.amount
      else chartMap[date].salidas += tx.amount
    }

    const chart = Object.entries(chartMap)
      .map(([date, values]) => ({ date, ...values }))
      .reverse()

      return NextResponse.json({
        totalItems,
        totalOro: oro._sum.quantity || 0,
        totalEsmeralda: esmeralda._sum.quantity || 0,
        totalDiamante: diamante._sum.quantity || 0,
        totalEntradas: raw
          .filter((tx) => tx.type === 'ENTRADA')
          .reduce((acc, tx) => acc + tx.amount, 0),
        totalSalidas: raw
          .filter((tx) => tx.type === 'SALIDA')
          .reduce((acc, tx) => acc + tx.amount, 0),
        lastMovements: recent.map((r) => ({
          id: r.id,
          itemName: r.item.name,
          type: r.type,
          amount: r.amount,
        
          createdAt: r.createdAt,
        })),
        chart,
      });
  } catch (error) {
    console.error('Error en dashboard API:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
