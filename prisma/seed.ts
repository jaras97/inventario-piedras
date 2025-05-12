import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Crear roles implícitamente (usando enum Role de Prisma)

  // Usuarios
  const adminPassword = await bcrypt.hash('admin123', 10);
  const auditorPassword = await bcrypt.hash('auditor123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
      isAuthorized: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'auditor@test.com' },
    update: {},
    create: {
      email: 'auditor@test.com',
      name: 'Auditor',
      password: auditorPassword,
      role: 'AUDITOR',
      isAuthorized: true,
    },
  });

  // Tipos
  const emerald = await prisma.inventoryType.upsert({
    where: { name: 'Esmeralda' },
    update: {},
    create: { name: 'Esmeralda' },
  });

  await prisma.inventoryType.upsert({
    where: { name: 'Oro' },
    update: {},
    create: { name: 'Oro' },
  });

  // Unidades
  const kilate = await prisma.inventoryUnit.upsert({
    where: { name: 'Kilate' },
    update: {},
    create: { name: 'Kilate' },
  });

  const unidad = await prisma.inventoryUnit.upsert({
    where: { name: 'Unidad' },
    update: {},
    create: { name: 'Unidad' },
  });

  // Productos
  const product1 = await prisma.inventoryItem.create({
    data: {
      name: 'Esmeralda fina pequeña',
      typeId: emerald.id,
      unitId: kilate.id,
      quantity: 10,
      price: 500, // por kilate
    },
  });

  const product2 = await prisma.inventoryItem.create({
    data: {
      name: 'Esmeralda fina grande',
      typeId: emerald.id,
      unitId: unidad.id,
      quantity: 3,
      price: 1500, // por unidad
    },
  });

  // Grupo de transacciones (ej. cargue grupal)
   await prisma.inventoryTransactionGroup.create({
    data: {
      userId: admin.id,
      transactions: {
        create: [
          {
            itemId: product1.id,
            amount: 5,
            type: 'CARGA_INDIVIDUAL',
            price: 500,
            userId: admin.id,
          },
          {
            itemId: product2.id,
            amount: 2,
            type: 'CARGA_INDIVIDUAL',
            price: 1500,
            userId: admin.id,
          },
        ],
      },
    },
  });

  console.log('✅ Datos de prueba generados correctamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error generando datos de prueba:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });