import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding...')

  // Crear algunos usuarios autorizados
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
  })

  // Crear inventario inicial
  await prisma.inventoryItem.createMany({
    data: [
      {
        name: 'Esmeralda colombiana',
        type: 'esmeralda',
        unit: 'kilates',
        quantity: 125.5,
      },
      {
        name: 'Lingote de oro 24k',
        type: 'oro',
        unit: 'gramos',
        quantity: 380,
      },
      {
        name: 'Diamante pulido',
        type: 'diamante',
        unit: 'unidad',
        quantity: 10,
      },
    ],
  })

  console.log('✅ Seed completed.')
}

main()
  .catch((e) => {
    console.error('❌ Error in seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })