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
  totalTransactions: number;
  // totalUnits ya no se usa → lo eliminamos del estado
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
        setData(json);
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
        <span className='ml-2 text-sm sm:text-base'>Cargando dashboard...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <p className='text-red-600 text-sm sm:text-base'>
        Error al cargar los datos del dashboard
      </p>
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
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='max-w-8xl mx-auto space-y-6 lg:space-y-8'>
        {/* Resumen general */}

        {/* Gráfico mensual */}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base sm:text-lg'>
              Ventas Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent className='h-64 sm:h-72 lg:h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={data.monthlySales}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='month' />
                <YAxis />
                <Tooltip
                  formatter={(value: number | string) =>
                    `$${Number(value).toLocaleString()}`
                  }
                />
                <Legend />
                <Bar dataKey='total' name='Ventas' fill='#3b82f6' />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top productos */}
        <section className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
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
    </div>
  );
}
