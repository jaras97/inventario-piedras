'use client';

import { useDashboardData } from '@/hooks/useDashboardData';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

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

      {/* Últimos movimientos */}
      <section>
        <h2 className='text-lg font-semibold mb-2'>Últimos movimientos</h2>
        <div className='overflow-auto border rounded'>
          <table className='min-w-full text-sm text-left border-collapse'>
            <thead className='bg-gray-100'>
              <tr>
                <th className='px-4 py-2 border-b'>Fecha</th>
                <th className='px-4 py-2 border-b'>Material</th>
                <th className='px-4 py-2 border-b'>Tipo</th>
                <th className='px-4 py-2 border-b'>Cantidad</th>
                <th className='px-4 py-2 border-b'>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {data.lastMovements.map((mov) => (
                <tr key={mov.id} className='hover:bg-gray-50'>
                  <td className='px-4 py-2 border-b'>
                    {format(new Date(mov.createdAt), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className='px-4 py-2 border-b'>{mov.itemName}</td>
                  <td className='px-4 py-2 border-b'>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        mov.type === 'ENTRADA'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {mov.type}
                    </span>
                  </td>
                  <td className='px-4 py-2 border-b'>{mov.amount}</td>
                  <td className='px-4 py-2 border-b'>{mov.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
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
  const bgMap = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
  };

  return (
    <div className={`rounded p-4 shadow-sm ${bgMap[color]}`}>
      <p className='text-sm font-medium'>{title}</p>
      <p className='text-2xl font-bold mt-1'>{value}</p>
    </div>
  );
}
