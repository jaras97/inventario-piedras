import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Crea una transacción de inventario (ENTRADA o SALIDA) y actualiza el stock.
 */
export async function createTransaction({
  itemId,
  userId,
  quantity,
  type,
}: {
  itemId: string;
  userId: string;
  quantity: number;
  type: TransactionType;
}) {
  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
  if (!item) throw new Error('Item no encontrado');

  // Validación para SALIDA: stock suficiente
  if (type === TransactionType.SALIDA && item.quantity < quantity) {
    throw new Error('Stock insuficiente para la venta');
  }

  // Calcular nueva cantidad
  const newQuantity =
    type === TransactionType.ENTRADA
      ? item.quantity + quantity
      : item.quantity - quantity;

  const updatedItem = await prisma.inventoryItem.update({
    where: { id: itemId },
    data: { quantity: newQuantity },
  });

  // Registrar transacción
  const transaction = await prisma.inventoryTransaction.create({
    data: {
      itemId,
      userId,
      type,
      amount: quantity, // si tu modelo usa `amount`, asegúrate de usar el campo correcto
    },
  });

  return { updatedItem, transaction };
}

/**
 * Obtener historial de transacciones (últimos 50 movimientos)
 */
export async function getTransactionHistory(itemId: string) {
  return await prisma.inventoryTransaction.findMany({
    where: { itemId },
    include: {
      User: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}