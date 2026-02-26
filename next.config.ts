import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Alias para resolver correctamente el cliente de Prisma en el cliente (navegador)
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Resolver @prisma/client/index-browser correctamente
        '@prisma/client/index-browser':
          require.resolve('@prisma/client/index-browser'),
        // Asegurar que .prisma/client apunte a la ubicación correcta
        '.prisma/client/index-browser':
          require.resolve('@prisma/client/index-browser'),
      };
    }

    // Mejorar el manejo de módulos externos
    if (isServer) {
      // Excluir @prisma/client del bundle del servidor para evitar duplicación
      config.externals = [...(config.externals || []), '@prisma/client'];
    }

    return config;
  },
  // Lista de paquetes que deben permanecer como externos en el servidor
  serverExternalPackages: ['@prisma/client', 'pg', 'prisma'],
  // Opcional: optimizaciones para Prisma
  transpilePackages: ['@prisma/client'],
};

export default nextConfig;
