import { defineConfig } from 'prisma/config';

export default defineConfig({
  datasource: {
    // 👇 La URL debe estar aquí, NO en el schema.prisma
    url: process.env.DATABASE_URL as string,
  },
  // Opcional: puedes especificar la ruta de las migraciones
  migrations: {
    path: 'prisma/migrations',
  },
});
