// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { hash } from 'bcryptjs';
import { Prisma } from '@prisma/client';

// Helper para obtener params desde pathname
function getUserIdFromUrl(req: NextRequest): string | null {
  const url = new URL(req.url);
  const match = url.pathname.match(/\/api\/users\/([^/]+)/);
  return match?.[1] || null;
}

export async function PUT(req: NextRequest) {
  try {
    const id = getUserIdFromUrl(req);
    if (!id) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const { name, email, password, role, isAuthorized } = await req.json();

    const updateData: Prisma.UserUpdateInput = {
      name,
      email,
      role,
      isAuthorized,
    };

    if (password) {
      updateData.password = await hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: updatedUser });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = getUserIdFromUrl(req);
    if (!id) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}