import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Solo aplicar configuraciones para el lado del cliente (navegador)
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Alias para resolver correctamente el cliente de Prisma en el navegador
        '@prisma/client/index-browser':
          require.resolve('@prisma/client/index-browser'),
      };
    }

    return config;
  },
  // Los paquetes que deben permanecer en el servidor (NO transpilar)
  serverExternalPackages: [
    '@prisma/client',
    'prisma',
    'pg',
    '@prisma/adapter-pg',
  ],
  // NO incluyas @prisma/client aquí
  // transpilePackages: [] - esto está vacío o no existe
};

export default nextConfig;
