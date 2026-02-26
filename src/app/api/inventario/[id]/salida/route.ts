import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { hasWriteAccess } from '@/lib/auth/roles';
import { TransactionType, PaymentMethod } from '@prisma/client';
import { roundToDecimals } from '@/lib/utils/round';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const { amount, price, paymentMethod, clientName, notes, soldAt } = body;

    // Validaciones básicas
    if (!amount || amount <= 0 || !price || price <= 0 || !paymentMethod) {
      return NextResponse.json(
        { error: 'Datos inválidos o incompletos' },
        { status: 400 },
      );
    }

    // Validar método de pago contra enum
    const validMethods: PaymentMethod[] = [
      'EFECTIVO',
      'TRANSFERENCIA',
      'NEQUI',
      'DAVIPLATA',
      'TARJETA',
      'OTRO',
    ];

    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Método de pago inválido' },
        { status: 400 },
      );
    }

    const roundedAmount = roundToDecimals(amount, 3);
    const roundedPrice = roundToDecimals(price, 3);

    // Validar existencia del item
    const item = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json(
        { error: 'Item no encontrado' },
        { status: 404 },
      );
    }

    // ✅ Validar stock disponible (Decimal -> number)
    if (Number(item.quantity) < amount) {
      return NextResponse.json(
        { error: 'No hay suficiente cantidad en inventario' },
        { status: 400 },
      );
    }

    // Validar sesión y permisos
    const session = await getServerSession(authOptions);
    const role = session?.user?.role || '';
    if (!hasWriteAccess(role)) {
      return NextResponse.json(
        { error: 'No autorizado para realizar ventas' },
        { status: 403 },
      );
    }

    const createdAt = soldAt ? new Date(soldAt) : undefined;

    // 1. Crear grupo de transacción
    const group = await prisma.inventoryTransactionGroup.create({
      data: {
        paymentMethod,
        clientName: clientName || null,
        notes: notes || null,
        userId: session?.user.id,
        ...(createdAt && { createdAt }), // 👈 sobrescribe default(now())
      },
    });

    // 2. Crear transacción asociada al grupo
    await prisma.inventoryTransaction.create({
      data: {
        itemId: id,
        type: TransactionType.VENTA_INDIVIDUAL,
        amount: roundedAmount,
        price: roundedPrice,
        groupId: group.id,
        userId: session?.user.id,
        ...(createdAt && { createdAt }), // 👈 igual que el grupo
      },
    });

    // 3. Actualizar inventario
    await prisma.inventoryItem.update({
      where: { id },
      data: {
        quantity: {
          decrement: roundedAmount,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al registrar venta individual:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
