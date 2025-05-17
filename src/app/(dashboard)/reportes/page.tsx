'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Select } from '@/components/ui/Select';
import { DynamicTable } from '@/components/ui/DynamicTable';
import { ColumnDef } from '@tanstack/react-table';
import { MonthYearPicker } from '@/components/ui/MonthPicker';
import { saveAs } from 'file-saver';
import moment from 'moment-timezone';
import ResumenTable from '@/components/components/ResumenTable';

import { ROLES } from '@/lib/auth/roles';
import { useRoleProtection } from '@/lib/hooks/useCurrentUser';

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
};

type ContableResumen = {
  totalVentas: number;
  totalUnidades: number;
  transacciones: number;
};

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
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const { user, isLoading } = useRoleProtection([ROLES.ADMIN, ROLES.AUDITOR]);

  const columns: ColumnDef<Reporte>[] = [
    { header: 'Fecha', accessorKey: 'fecha' },
    { header: 'Producto', accessorKey: 'producto' },
    { header: 'Cantidad', accessorKey: 'cantidad' },
    { header: 'Precio Unit', accessorKey: 'precioUnit' },
    { header: 'Total', accessorKey: 'total' },
    { header: 'Usuario', accessorKey: 'usuario' },
  ];

  const getDateRange = () => {
    const zone = 'America/Bogota';

    if (filters.reportKind === 'inventario') return { from: '', to: '' };

    if (filters.reportType === 'Diario') {
      const base = moment.tz(filters.from, zone);
      return {
        from: base.startOf('day').utc().format(),
        to: base.endOf('day').utc().format(),
      };
    }

    if (filters.reportType === 'Mensual') {
      const base = moment.tz(
        { year: filters.monthYear.year, month: filters.monthYear.month - 1 },
        zone,
      );
      return {
        from: base.startOf('month').utc().format(),
        to: base.endOf('month').utc().format(),
      };
    }

    const from = moment.tz(filters.from, zone).startOf('day').utc().format();
    const to = moment.tz(filters.to, zone).endOf('day').utc().format();

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
      body.from = from;
      body.to = to;
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

  if (isLoading || !user) return null;

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
                value: `$${(
                  contableResumen?.totalVentas ?? 0
                ).toLocaleString()}`,
              },
              {
                label: 'Total unidades',
                value: (contableResumen?.totalUnidades ?? 0).toFixed(2),
              },
              {
                label: 'Transacciones',
                value: contableResumen?.transacciones ?? 0,
              },
            ]}
          />

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
