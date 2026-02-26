// utils/validation.ts
import { z } from 'zod';

export function getAmountSchema(valueType: 'INTEGER' | 'DECIMAL') {
  return valueType === 'INTEGER'
    ? z
        .number({ invalid_type_error: 'Debe ser un número' })
        .int('Debe ser un número entero')
        .positive('Debe ser mayor a cero')
    : z
        .number({ invalid_type_error: 'Debe ser un número' })
        .positive('Debe ser mayor a cero');
}