// hooks/useCodesByCategory.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCodesByCategory(categoryId?: string) {
  const { data, isLoading, error } = useSWR(
    categoryId ? `/api/codigos?categoryId=${categoryId}` : null,
    fetcher
  );

  return {
    codes: data ?? [],
    isLoading,
    error,
  };
}