import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import ExcelJS from 'exceljs';
import moment from 'moment-timezone';

export async function POST(req: NextRequest) {
  try {
    const { from, to, code } = await req.json();

    if (!from || !to) {
      return NextResponse.json({ error: 'Fechas requeridas' }, { status: 400 });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const where = {
      type: { in: ['VENTA_INDIVIDUAL', 'VENTA_GRUPAL'] },
      createdAt: {
        gte: fromDate,
        lte: toDate,
      },
      ...(code && {
        item: {
          subcategoryCode: {
            code: {
              equals: code.toUpperCase(),
              mode: 'insensitive',
            },
          },
        },
      }),
    };

    const ventas = await prisma.inventoryTransaction.findMany({
      where,
      include: {
        item: true,
        User: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Reporte Contable');

    sheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Producto', key: 'producto', width: 30 },
      { header: 'Cantidad', key: 'cantidad', width: 15 },
      { header: 'Precio Unitario', key: 'precioUnit', width: 20 },
      { header: 'Total', key: 'total', width: 20 },
      { header: 'Usuario', key: 'usuario', width: 25 },
    ];

    const timezone = 'America/Bogota';

    ventas.forEach((tx) => {
      const total = tx.price ? tx.price * tx.amount : '';
      const fechaLocal = moment(tx.createdAt).tz(timezone).format('DD/MM/YYYY HH:mm');
      sheet.addRow({
        fecha: fechaLocal,
        producto: tx.item?.name ?? '',
        cantidad: tx.amount,
        precioUnit: tx.price ?? '',
        total,
        usuario: tx.User?.name ?? 'Sistema',
      });
    });

    // Agregar resumen
    const totalVentas = ventas.reduce((sum, v) => sum + (v.price ?? 0) * v.amount, 0);
    const totalUnidades = ventas.reduce((sum, v) => sum + v.amount, 0);

    sheet.addRow([]);
    sheet.addRow(['', '', '', 'Total vendido', totalVentas]);
    sheet.addRow(['', '', '', 'Total unidades', totalUnidades]);
    sheet.addRow(['', '', '', 'Transacciones', ventas.length]);

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=ReporteContable.xlsx`,
      },
    });
  } catch (error) {
    console.error('Error generando Excel contable:', error);
    return NextResponse.json(
      { error: 'Error generando Excel contable' },
      { status: 500 }
    );
  }
}