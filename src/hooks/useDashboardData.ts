'use client';

import useSWR from 'swr';

type DashboardData = {
  totalItems: number;
  totalEntradas: number;
  totalSalidas: number;
  lastMovements: {
    id: string;
    itemName: string;
    type: 'ENTRADA' | 'SALIDA';
    amount: number;
    user: string;
    createdAt: string;
  }[];
  chartData: {
    date: string;
    entradas: number;
    salidas: number;
  }[];
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useDashboardData() {
  const { data, error, isLoading } = useSWR<DashboardData>('/api/dashboard', fetcher);

  return {
    data,
    error,
    isLoading,
  };
}