import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import ExcelJS from 'exceljs';

export async function POST() {
  try {
    const items = await prisma.inventoryItem.findMany({
      include: {
        category: true, // ✅ nombre de categoría
        unit: true,     // ✅ unidad
        subcategoryCode: true, // ✅ código
      },
      orderBy: {
        name: 'asc',
      },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Inventario');

    sheet.columns = [
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Categoría', key: 'categoria', width: 20 },
      { header: 'Código', key: 'codigo', width: 15 },
      { header: 'Unidad', key: 'unidad', width: 15 },
      { header: 'Cantidad', key: 'cantidad', width: 15 },
      { header: 'Precio Unitario', key: 'precio', width: 20 },
      { header: 'Subtotal', key: 'subtotal', width: 20 },
    ];

    items.forEach((item) => {
      sheet.addRow({
        nombre: item.name,
        categoria: item.category?.name ?? '',
        codigo: item.subcategoryCode?.code ?? '',
        unidad: item.unit.name,
        cantidad: item.quantity,
        precio: item.price,
        subtotal: item.quantity * item.price,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=ReporteInventario.xlsx`,
      },
    });
  } catch (error) {
    console.error('Error generando Excel de inventario:', error);
    return NextResponse.json(
      { error: 'Error generando Excel de inventario' },
      { status: 500 }
    );
  }
}