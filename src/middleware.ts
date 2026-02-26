import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/unauthorized', '/api'];

// Extensión del tipo JWT para incluir campos personalizados
type CustomToken = {
  exp?: number;
  isAuthorized?: boolean;
  role?: string;
  [key: string]: unknown; 
};

export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;

    // Permitir acceso sin protección a rutas públicas, assets y archivos estáticos
    if (
      PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
      pathname.startsWith('/_next') ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    const token = (await getToken({ req })) as CustomToken;

    // No hay token → redirigir al login
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(loginUrl);
    }

    // Validar expiración (token.exp está en segundos UNIX)
    const currentTime = Math.floor(Date.now() / 1000);
    if (typeof token.exp === 'number' && token.exp < currentTime) {
      console.warn('[Middleware] Token expirado. Redirigiendo...');
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(loginUrl);
    }

    // Validar autorización personalizada
    if (!token.isAuthorized) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware] Error inesperado:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// Rutas protegidas por el middleware
export const config = {
  matcher: ['/', '/dashboard/:path*', '/inventario/:path*', '/historial/:path*', '/admin/:path*'],
};