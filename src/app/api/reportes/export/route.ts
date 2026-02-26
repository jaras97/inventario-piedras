// app/api/reportes/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';
import { TransactionType } from '@prisma/client';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { from, to, product, transactionType } = await req.json();

    if (!from || !to) {
      return NextResponse.json({ error: 'Fechas requeridas' }, { status: 400 });
    }

    const where: Prisma.InventoryTransactionWhereInput = {
      ...(transactionType &&
        transactionType !== 'Todas' && {
          type: transactionType as TransactionType,
        }),
      ...(product &&
        product.toLowerCase() !== 'todos' && {
          item: {
            name: {
              contains: product,
              mode: 'insensitive',
            },
          },
        }),
      createdAt: {
        gte: new Date(from),
        lte: new Date(to),
      },
    };

    const transactions = await prisma.inventoryTransaction.findMany({
      where,
      include: {
        item: true,
        User: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Reporte de Transacciones');

    sheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Producto', key: 'producto', width: 30 },
      { header: 'Cantidad', key: 'cantidad', width: 15 },
      { header: 'Precio Unitario', key: 'precioUnit', width: 20 },
      { header: 'Total', key: 'total', width: 20 },
      { header: 'Usuario', key: 'usuario', width: 25 },
      { header: 'Tipo de Transacción', key: 'tipo', width: 25 },
    ];

    transactions.forEach((tx) => {
      // Normalizamos Decimal -> number
      const amountNum = Number(tx.amount ?? 0);
      const priceNum = tx.price != null ? Number(tx.price) : 0;

      const total = priceNum ? priceNum * amountNum : '';

      sheet.addRow({
        fecha: new Date(tx.createdAt).toLocaleString(),
        producto: tx.item?.name ?? '',
        cantidad: amountNum,
        precioUnit: priceNum || '',
        total,
        usuario: tx.User?.name ?? 'Sistema',
        tipo: tx.type,
      });
    });

    // Agregar totales al final del archivo
    const totalVentas = transactions.reduce((sum, v) => {
      const amountNum = Number(v.amount ?? 0);
      const priceNum = v.price != null ? Number(v.price) : 0;
      return sum + priceNum * amountNum;
    }, 0);

    const totalUnidades = transactions.reduce((sum, v) => {
      const amountNum = Number(v.amount ?? 0);
      return sum + amountNum;
    }, 0);

    sheet.addRow([]);
    sheet.addRow(['', '', '', 'Total vendido', totalVentas]);
    sheet.addRow(['', '', '', 'Total unidades', totalUnidades]);
    sheet.addRow(['', '', '', 'Transacciones', transactions.length]);

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=ReporteTransacciones.xlsx`,
      },
    });
  } catch (error) {
    console.error('Error generando Excel de transacciones:', error);
    return NextResponse.json(
      { error: 'Error generando Excel' },
      { status: 500 },
    );
  }
}
