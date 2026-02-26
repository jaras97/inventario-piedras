export const formatNumber = (value: number, decimals = 3): string => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
};