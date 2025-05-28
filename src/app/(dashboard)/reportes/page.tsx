'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Select } from '@/components/ui/Select';
import { DynamicTable } from '@/components/ui/DynamicTable';
import { ColumnDef } from '@tanstack/react-table';
import { MonthYearPicker } from '@/components/ui/MonthPicker';
import { saveAs } from 'file-saver';

import ResumenTable from '@/components/components/ResumenTable';
import { DateTime } from 'luxon';
import { formatNumber } from '@/lib/utils/format';

type ReportType = 'Diario' | 'Mensual' | 'Por rango';
type ReportKind = 'contable' | 'inventario';

type ReportFilters = {
  reportKind: ReportKind;
  reportType: ReportType;
  from: string;
  to: string;
  monthYear: { year: number; month: number };
};

type Reporte = {
  fecha: string;
  producto: string;
  cantidad: number;
  precioUnit: number;
  total: number;
  usuario: string;
  metodoPago: string;
  cliente: string;
  notas: string;
};

type ContableResumen = {
  totalVentas: number;
  totalUnidades: number;
  transacciones: number;
};

type MetodoResumen = Record<string, number>;

type ExportBody = {
  from?: string;
  to?: string;
};

const reportTypes = [
  { label: 'Diario', value: 'Diario' },
  { label: 'Mensual', value: 'Mensual' },
  { label: 'Por rango', value: 'Por rango' },
];

const reportKinds = [
  { label: 'Contable', value: 'contable' },
  { label: 'Inventario', value: 'inventario' },
];

export default function ReportesPage() {
  const [filters, setFilters] = useState<ReportFilters>({
    reportKind: 'contable',
    from: '',
    to: '',
    reportType: 'Diario',
    monthYear: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    },
  });

  const [data, setData] = useState<Reporte[]>([]);
  const [contableResumen, setContableResumen] =
    useState<ContableResumen | null>(null);
  const [metodoResumen, setMetodoResumen] = useState<MetodoResumen | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const columns: ColumnDef<Reporte>[] = [
    { header: 'Fecha', accessorKey: 'fecha' },
    { header: 'Producto', accessorKey: 'producto' },
    {
      header: 'Cantidad',
      accessorKey: 'cantidad',
      cell: ({ getValue }) => formatNumber(getValue<number>(), 3),
    },
    {
      header: 'Precio Unit',
      accessorKey: 'precioUnit',
      cell: ({ getValue }) => `$${formatNumber(getValue<number>(), 3)}`,
    },
    {
      header: 'Total',
      accessorKey: 'total',
      cell: ({ getValue }) => `$${formatNumber(getValue<number>(), 3)}`,
    },
    { header: 'Usuario', accessorKey: 'usuario' },
    { header: 'Método de pago', accessorKey: 'metodoPago' },
    { header: 'Cliente', accessorKey: 'cliente' },
    { header: 'Notas', accessorKey: 'notas' },
  ];

  const getDateRange = () => {
    const zone = 'America/Bogota';

    if (filters.reportKind === 'inventario') return { from: '', to: '' };

    if (filters.reportType === 'Diario') {
      const base = DateTime.fromISO(filters.from, { zone });

      return {
        from: base.startOf('day').toUTC().toISO(),
        to: base.endOf('day').toUTC().toISO(),
      };
    }

    if (filters.reportType === 'Mensual') {
      const base = DateTime.fromObject(
        { year: filters.monthYear.year, month: filters.monthYear.month },
        { zone },
      );

      return {
        from: base.startOf('month').toUTC().toISO(),
        to: base.endOf('month').toUTC().toISO(),
      };
    }

    const from = DateTime.fromISO(filters.from, { zone })
      .startOf('day')
      .toUTC()
      .toISO();
    const to = DateTime.fromISO(filters.to, { zone })
      .endOf('day')
      .toUTC()
      .toISO();

    return { from, to };
  };

  const handleSearch = async () => {
    setLoading(true);
    const { from, to } = getDateRange();

    if (filters.reportKind === 'contable') {
      const queryParams: Record<string, string> = {
        page: page.toString(),
        limit: pageSize.toString(),
      };

      if (from) queryParams.from = from;
      if (to) queryParams.to = to;

      const query = new URLSearchParams(queryParams);
      const res = await fetch(`/api/reportes/contable?${query}`);
      const json = await res.json();

      setContableResumen({
        totalVentas: json.totalVentas,
        totalUnidades: json.totalUnidades,
        transacciones: json.transacciones,
      });

      setMetodoResumen(json.resumenPorMetodoPago || {});
      setData(json.data || []);
      setTotal(json.transacciones || 0);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (filters.reportKind === 'contable') {
      handleSearch();
    }
  }, [page]);

  const handleDownload = async () => {
    const { from, to } = getDateRange();

    if (filters.reportKind !== 'inventario' && (!from || !to)) {
      alert('Fechas no válidas para generar el archivo.');
      return;
    }

    const body: ExportBody = {};

    if (filters.reportKind !== 'inventario') {
      if (from) body.from = from;
      if (to) body.to = to;
    }

    const endpoint =
      filters.reportKind === 'contable'
        ? '/api/reportes/contable/export'
        : '/api/reportes/inventario/export';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.status !== 200) {
      alert('No se pudo generar el archivo.');
      return;
    }

    const blob = await res.blob();
    saveAs(blob, 'Reporte.xlsx');
  };

  return (
    <div className='p-4'>
      <h1 className='text-xl font-bold mb-4'>Reportes</h1>

      <div className='grid gap-4 md:grid-cols-3 mb-6'>
        <Select
          label='Tipo de reporte general'
          options={reportKinds}
          value={
            reportKinds.find((r) => r.value === filters.reportKind) || null
          }
          onChange={(opt) => {
            setFilters({ ...filters, reportKind: opt.value as ReportKind });
            setContableResumen(null);
            setMetodoResumen(null);
            setData([]);
          }}
        />

        {filters.reportKind !== 'inventario' && (
          <Select
            label='Periodo'
            options={reportTypes}
            value={
              reportTypes.find((r) => r.value === filters.reportType) || null
            }
            onChange={(opt) =>
              setFilters({ ...filters, reportType: opt.value as ReportType })
            }
          />
        )}

        {filters.reportKind !== 'inventario' &&
          filters.reportType === 'Diario' && (
            <DatePicker
              label='Selecciona el día'
              value={filters.from}
              onChange={(v) => setFilters({ ...filters, from: v })}
            />
          )}

        {filters.reportKind !== 'inventario' &&
          filters.reportType === 'Mensual' && (
            <MonthYearPicker
              label='Mes y año'
              value={filters.monthYear}
              onChange={(v) => setFilters({ ...filters, monthYear: v })}
            />
          )}

        {filters.reportKind !== 'inventario' &&
          filters.reportType === 'Por rango' && (
            <>
              <DatePicker
                label='Desde'
                value={filters.from}
                onChange={(v) => setFilters({ ...filters, from: v })}
              />
              <DatePicker
                label='Hasta'
                value={filters.to}
                onChange={(v) => setFilters({ ...filters, to: v })}
              />
            </>
          )}
      </div>

      <div className='flex gap-2 mb-4'>
        {filters.reportKind !== 'inventario' && (
          <Button onClick={handleSearch}>Ver Reporte</Button>
        )}
        <Button variant='outline' onClick={handleDownload}>
          Descargar Excel
        </Button>
      </div>

      {filters.reportKind === 'contable' && contableResumen && (
        <>
          <ResumenTable
            title='Resumen Contable'
            rows={[
              {
                label: 'Total ventas',
                value: `$${formatNumber(contableResumen?.totalVentas ?? 0, 3)}`,
              },
              {
                label: 'Total unidades',
                value: formatNumber(contableResumen?.totalUnidades ?? 0, 3),
              },
              {
                label: 'Transacciones',
                value: formatNumber(contableResumen?.transacciones ?? 0, 0),
              },
            ]}
          />

          {metodoResumen && (
            <div className='mb-6'>
              <h2 className='text-lg font-semibold mb-2'>
                Ventas por método de pago
              </h2>
              <div className='overflow-x-auto rounded-lg shadow-md'>
                <table className='min-w-full text-sm border border-gray-200'>
                  <thead className='bg-gray-100 text-left'>
                    <tr>
                      <th className='px-4 py-2 border-b'>Método de pago</th>
                      <th className='px-4 py-2 border-b'>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(metodoResumen).map(([metodo, valor]) => (
                      <tr key={metodo} className='bg-white border-b'>
                        <td className='px-4 py-2'>{metodo}</td>
                        <td className='px-4 py-2 font-medium'>
                          ${formatNumber(valor, 3)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DynamicTable
            title='Detalle de ventas'
            columns={columns}
            data={data}
            isLoading={loading}
            pagination={{
              page,
              pageSize,
              total,
              onPageChange: setPage,
            }}
          />
        </>
      )}
    </div>
  );
}
