'use client';

import { useDashboardData } from '@/hooks/useDashboardData';
import { Loader2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { DynamicTable } from '@/components/ui/DynamicTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type Movement = {
  id: string;
  createdAt: string;
  type: 'ENTRADA' | 'SALIDA';
  amount: number;
  itemName: string;
  user: string;
};

export default function DashboardPage() {
  const { data, error, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-full py-32'>
        <Loader2 className='animate-spin w-6 h-6 text-blue-500' />
        <span className='ml-2'>Cargando dashboard...</span>
      </div>
    );
  }

  if (error || !data) {
    return <p className='text-red-600'>Error al cargar el dashboard</p>;
  }

  const columns: ColumnDef<Movement>[] = [
    {
      header: 'Fecha',
      accessorFn: (row) => format(new Date(row.createdAt), 'dd/MM/yyyy HH:mm'),
    },
    { header: 'Material', accessorKey: 'itemName' },
    {
      header: 'Tipo',
      accessorKey: 'type',
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded ${
            row.original.type === 'ENTRADA'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {row.original.type}
        </span>
      ),
    },
    { header: 'Cantidad', accessorKey: 'amount' },
    { header: 'Usuario', accessorKey: 'user' },
  ];

  const chartData = [
    {
      name: 'Movimientos',
      Entradas: data.totalEntradas,
      Salidas: data.totalSalidas,
    },
  ];

  return (
    <div className='p-6 space-y-6'>
      {/* Totales */}
      <section className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <SummaryCard title='Total Materiales' value={data.totalItems} />
        <SummaryCard
          title='Total Entradas'
          value={data.totalEntradas}
          color='green'
        />
        <SummaryCard
          title='Total Salidas'
          value={data.totalSalidas}
          color='red'
        />
      </section>

      {/* Gráfica */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen gráfico</CardTitle>
        </CardHeader>
        <CardContent className='h-72'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={chartData}>
              <XAxis dataKey='name' />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey='Entradas' fill='#22c55e' />
              <Bar dataKey='Salidas' fill='#ef4444' />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Últimos movimientos */}
      <DynamicTable
        title='Últimos Movimientos'
        data={data.lastMovements}
        columns={columns}
      />
    </div>
  );
}

function SummaryCard({
  title,
  value,
  color = 'blue',
}: {
  title: string;
  value: number;
  color?: 'blue' | 'green' | 'red';
}) {
  const colorMap = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-sm'>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${colorMap[color]}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
