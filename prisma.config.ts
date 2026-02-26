import { defineConfig } from 'prisma/config';
import 'dotenv/config'; // 👈 AHORA FUNCIONARÁ

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
  migrations: {
    path: 'prisma/migrations',
  },
});
