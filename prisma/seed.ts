import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  // Crear tipos
  await prisma.inventoryType.createMany({
    data: [
      { name: 'oro' },
      { name: 'esmeralda' },
      { name: 'diamante' },
    ],
    skipDuplicates: true,
  });

  // Crear unidades
  await prisma.inventoryUnit.createMany({
    data: [
      { name: 'gramos' },
      { name: 'kilates' },
      { name: 'unidad' },
    ],
    skipDuplicates: true,
  });

  // Obtener IDs actualizados desde base de datos
  const [oro, esmeralda, diamante] = await prisma.inventoryType.findMany();
  const [gramos, kilates, unidad] = await prisma.inventoryUnit.findMany();

  // Crear usuarios
  await prisma.user.createMany({
    data: [
      {
        email: 'admin@piedras.com',
        name: 'Administrador',
        isAuthorized: true,
        role: 'ADMIN',
      },
      {
        email: 'auditor@piedras.com',
        name: 'Auditor de pruebas',
        isAuthorized: false,
        role: 'AUDITOR',
      },
    ],
    skipDuplicates: true,
  });

  // Crear inventario con relaciones correctas
  await prisma.inventoryItem.createMany({
    data: [
      {
        name: 'Esmeralda colombiana',
        typeId: esmeralda.id,
        unitId: kilates.id,
        quantity: 125.5,
      },
      {
        name: 'Lingote de oro 24k',
        typeId: oro.id,
        unitId: gramos.id,
        quantity: 380,
      },
      {
        name: 'Diamante pulido',
        typeId: diamante.id,
        unitId: unidad.id,
        quantity: 10,
      },
    ],
  });

  console.log('✅ Seed completed.');
}

main()
  .catch((e) => {
    console.error('❌ Error in seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });