'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { DynamicTable } from '@/components/ui/DynamicTable';
import { ColumnDef } from '@tanstack/react-table';

// Tipos de datos esperados
interface MonthlySales {
  month: string;
  total: number;
}

interface TopProduct {
  name: string;
  quantity: number;
  total: number;
}

interface DashboardData {
  monthlySales: MonthlySales[];
  topToday: TopProduct[];
  topMonth: TopProduct[];
  topAllTime: TopProduct[];
  totalRevenue: number;
  totalUnits: number;
  totalTransactions: number;
}

export default function ContableDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/dashboard/contable');
        const json = await res.json();

        const totalRevenue = json.topAllTime.reduce(
          (acc: number, p: { total: number }) => acc + p.total,
          0,
        );

        const totalUnits = json.topAllTime.reduce(
          (acc: number, p: { quantity: number }) => acc + p.quantity,
          0,
        );
        const totalTransactions = json.monthlySales.length;

        setData({ ...json, totalRevenue, totalUnits, totalTransactions });
      } catch (err) {
        console.error('Error cargando dashboard contable:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-full py-32'>
        <Loader2 className='animate-spin w-6 h-6 text-blue-500' />
        <span className='ml-2'>Cargando dashboard...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <p className='text-red-600'>Error al cargar los datos del dashboard</p>
    );
  }

  const productColumns: ColumnDef<TopProduct>[] = [
    { header: 'Producto', accessorKey: 'name' },
    { header: 'Unidades Vendidas', accessorKey: 'quantity' },
    {
      header: 'Total',
      accessorKey: 'total',
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return `$${value.toLocaleString()}`;
      },
    },
  ];

  return (
    <div className='p-6 space-y-6'>
      {/* Resumen general */}
      <section className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <SummaryCard
          title='Ingresos Totales'
          value={data.totalRevenue}
          color='green'
          prefix='$'
        />
        <SummaryCard title='Unidades Vendidas' value={data.totalUnits} />
        <SummaryCard title='Transacciones' value={data.totalTransactions} />
      </section>

      {/* Gráfico mensual */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas Mensuales</CardTitle>
        </CardHeader>
        <CardContent className='h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={data.monthlySales}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey='total' name='Ventas' fill='#3b82f6' />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top productos */}
      <section className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <DynamicTable
          title='Más vendidos hoy'
          columns={productColumns}
          data={data.topToday}
        />
        <DynamicTable
          title='Más vendidos del mes'
          columns={productColumns}
          data={data.topMonth}
        />
        <DynamicTable
          title='Más vendidos históricos'
          columns={productColumns}
          data={data.topAllTime}
        />
      </section>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  color = 'blue',
  prefix = '',
}: {
  title: string;
  value: number;
  color?: 'blue' | 'green' | 'red';
  prefix?: string;
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
        <p className={`text-2xl font-bold ${colorMap[color]}`.trim()}>
          {prefix}
          {value.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
