export const roundToDecimals = (value: number, decimals = 3): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};