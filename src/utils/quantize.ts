// lib/utils/quantize.ts
import { Prisma } from '@prisma/client';

export const qDP = (v: number | string, dp: number) =>
  new Prisma.Decimal(v).toDP(dp, Prisma.Decimal.ROUND_HALF_UP);

// fuerza 0 o 3 según el tipo de unidad:
export const qByUnit = (v: number | string, valueType: 'INTEGER'|'DECIMAL') =>
  valueType === 'INTEGER' ? qDP(v, 0) : qDP(v, 3);

// precios: normalmente 2 decimales
export const qPrice = (v: number | string) => qDP(v, 2);
