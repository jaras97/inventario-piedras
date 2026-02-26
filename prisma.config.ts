import { defineConfig } from 'prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
  // Opcional: si usas migraciones
  migrations: {
    path: 'prisma/migrations',
  },
});
