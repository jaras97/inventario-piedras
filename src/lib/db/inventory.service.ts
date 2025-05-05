// src/lib/db/inventory.service.ts
import { PrismaClient, TransactionType } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Crea una transacción de inventario (CARGA o VENTA) y actualiza el stock.
 */
export async function createTransaction({
  itemId,
  userId,
  quantity,
  type,
}: {
  itemId: string
  userId: string
  quantity: number
  type: TransactionType
}) {
  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } })
  if (!item) throw new Error('Item no encontrado')

  // Validación para ventas: stock suficiente
  if (type === 'VENTA' && item.quantity < quantity) {
    throw new Error('Stock insuficiente para la venta')
  }

  // Actualizar cantidad
  const newQuantity =
    type === 'CARGA'
      ? item.quantity + quantity
      : item.quantity - quantity

  const updatedItem = await prisma.inventoryItem.update({
    where: { id: itemId },
    data: { quantity: newQuantity },
  })

  // Registrar transacción
  const transaction = await prisma.inventoryTransaction.create({
    data: {
      itemId,
      userId,
      type,
      quantity,
    },
  })

  return { updatedItem, transaction }
}

/**
 * Obtener historial de transacciones (últimos 50 movimientos)
 */
export async function getTransactionHistory(itemId: string) {
  return await prisma.inventoryTransaction.findMany({
    where: { itemId },
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}