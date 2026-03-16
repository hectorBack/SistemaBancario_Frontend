import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Obtenemos el token de las cookies (es más seguro que localStorage para middleware)
  const token = request.cookies.get('auth_token');

  // Si intenta entrar al dashboard sin token, va al login
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Si ya está logueado e intenta ir al login, mándalo al dashboard
  if (request.nextUrl.pathname === '/login') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Configura qué rutas debe vigilar el middleware
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};