import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Crea una transacción de inventario (carga o venta) y actualiza el stock.
 */
export async function createTransaction({
  itemId,
  userId,
  quantity,
  type,
  price = 0,
}: {
  itemId: string;
  userId: string;
  quantity: number;
  type: TransactionType;
  price?: number; // solo aplica para ventas
}) {
  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
  if (!item) throw new Error('Item no encontrado');

  const isSale =
    type === 'VENTA_INDIVIDUAL' || type === 'VENTA_GRUPAL';

  const isLoad =
    type === 'CARGA_INDIVIDUAL' || type === 'CARGA_GRUPAL';

  if (!isSale && !isLoad && type !== 'EDICION_PRODUCTO') {
    throw new Error('Tipo de transacción no soportado');
  }

  // 🔹 Normalizar Decimal -> number para operar y comparar
  const currentQuantity = Number(item.quantity ?? 0);

  if (isSale && currentQuantity < quantity) {
    throw new Error('Stock insuficiente para la venta');
  }

  const newQuantity = isSale
    ? currentQuantity - quantity
    : currentQuantity + quantity;

  const updatedItem = await prisma.inventoryItem.update({
    where: { id: itemId },
    data: { quantity: newQuantity }, // Prisma castea number -> Decimal
  });

  const transaction = await prisma.inventoryTransaction.create({
    data: {
      itemId,
      userId,
      amount: quantity,
      price: isSale ? price : 0,
      type,
    },
  });

  return { updatedItem, transaction };
}

/**
 * Obtener historial de transacciones de un producto (últimos 50 movimientos)
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
