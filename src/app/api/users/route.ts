// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

// GET: Listar usuarios
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isAuthorized: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: users });
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 },
    );
  }
}

// POST: Crear usuario
export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, isAuthorized } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Correo y contraseña requeridos' },
        { status: 400 },
      );
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isAuthorized: !!isAuthorized,
      },
    });

    return NextResponse.json({ data: newUser });
  } catch {
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 },
    );
  }
}
