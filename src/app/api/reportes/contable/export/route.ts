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
        group: true,
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
      { header: 'Método de pago', key: 'metodoPago', width: 20 },
      { header: 'Cliente', key: 'cliente', width: 25 },
      { header: 'Notas', key: 'notas', width: 30 },
      { header: 'Usuario', key: 'usuario', width: 25 },
    ];

    const timezone = 'America/Bogota';
    const metodoMap: Record<string, number> = {};

    ventas.forEach((tx) => {
      // 🔹 Convertimos Decimal -> number antes de operar
      const amountNum = Number(tx.amount ?? 0);
      const priceNum = tx.price != null ? Number(tx.price) : 0;

      const total = priceNum * amountNum;

      const fechaLocal = moment(tx.createdAt)
        .tz(timezone)
        .format('DD/MM/YYYY HH:mm');
      const metodo = tx.group?.paymentMethod ?? 'N/A';

      // Sumar total por método de pago
      metodoMap[metodo] = (metodoMap[metodo] || 0) + total;

      sheet.addRow({
        fecha: fechaLocal,
        producto: tx.item?.name ?? '',
        cantidad: amountNum,
        precioUnit: priceNum || '',
        total,
        metodoPago: metodo,
        cliente: tx.group?.clientName ?? 'N/A',
        notas: tx.group?.notes ?? '',
        usuario: tx.User?.name ?? 'Sistema',
      });
    });

    // Agregar resumen general
    const totalVentas = ventas.reduce((sum, v) => {
      const amountNum = Number(v.amount ?? 0);
      const priceNum = v.price != null ? Number(v.price) : 0;
      return sum + priceNum * amountNum;
    }, 0);

    const totalUnidades = ventas.reduce((sum, v) => {
      const amountNum = Number(v.amount ?? 0);
      return sum + amountNum;
    }, 0);

    sheet.addRow([]);
    sheet.addRow(['Resumen General']);
    sheet.addRow(['Total vendido', totalVentas]);
    sheet.addRow(['Total unidades', totalUnidades]);
    sheet.addRow(['Transacciones', ventas.length]);

    // Agregar resumen por método de pago
    sheet.addRow([]);
    sheet.addRow(['Resumen por método de pago']);
    sheet.addRow(['Método de pago', 'Total']);

    Object.entries(metodoMap).forEach(([metodo, total]) => {
      sheet.addRow([metodo, total]);
    });

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
