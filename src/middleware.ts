import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/unauthorized', '/api'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permitir rutas públicas y estáticas
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path)) || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  const token = await getToken({ req });

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.url); // opcional: para redirigir después
    return NextResponse.redirect(loginUrl);
  }

  if (!token.isAuthorized) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

// Protege todas las rutas dentro del dashboard y admin
export const config = {
  matcher: ['/', '/dashboard/:path*', '/inventario/:path*', '/historial/:path*', '/admin/:path*'],
};