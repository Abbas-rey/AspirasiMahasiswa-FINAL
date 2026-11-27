import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { COOKIE_NAME, TokenPayload, secretKey } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let session: TokenPayload | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secretKey, {
        algorithms: ['HS256'],
      });
      session = payload as unknown as TokenPayload;
    } catch {
      session = null;
    }
  }

  // Allow public assets, open graph images, and static files unconditionally
  if (
    pathname.startsWith('/opengraph-image') ||
    pathname.startsWith('/twitter-image') ||
    pathname === '/og-banner.png' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Allow direct access to /login so users can always switch accounts or log in cleanly.
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Check Mahasiswa Routes
  if (pathname.startsWith('/dashboard/mahasiswa') || pathname.startsWith('/ajukan')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== 'MAHASISWA') {
      // Wrong role redirect
      const target =
        session.role === 'AKADEMISI'
          ? '/dashboard/akademisi'
          : session.role === 'ADMIN'
          ? '/dashboard/admin'
          : '/login';
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  // Check Akademisi Routes
  if (pathname.startsWith('/dashboard/akademisi')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== 'AKADEMISI') {
      const target =
        session.role === 'MAHASISWA'
          ? '/dashboard/mahasiswa'
          : session.role === 'ADMIN'
          ? '/dashboard/admin'
          : '/login';
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  // Check Admin Routes
  if (pathname.startsWith('/dashboard/admin')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== 'ADMIN') {
      const target =
        session.role === 'MAHASISWA'
          ? '/dashboard/mahasiswa'
          : session.role === 'AKADEMISI'
          ? '/dashboard/akademisi'
          : '/login';
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/dashboard/:path*',
    '/ajukan/:path*',
  ],
};
