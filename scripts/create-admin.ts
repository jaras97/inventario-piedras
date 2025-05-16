// scripts/create-user.ts
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'usuario@gmail.com'
  const password = 'admin123' // solo se usará si usa login con contraseña
  const name = 'Administrador'
 const role: Role = Role.ADMIN;
  const isAuthorized = true

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    console.log(`❌ El usuario con email ${email} ya existe.`)
    return
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword, // necesario para login por credenciales
      role,
      isAuthorized,
    },
  })

  console.log(`✅ Usuario creado con éxito: ${user.email}`)
}

main()
  .catch((e) => {
    console.error('Error creando el usuario:', e)
  })
  .finally(() => {
    prisma.$disconnect()
  })