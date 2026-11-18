import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, verifyToken, clearSessionCookie } from '@/lib/auth';
import { isSessionActive } from '@/lib/session';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Check if session was evicted by a 3rd device login
  if (payload.session_id) {
    const active = await isSessionActive(payload.session_id);
    if (!active) {
      const response = NextResponse.json(
        {
          user: null,
          error: 'Sesi akun Anda di perangkat ini telah dihentikan karena akun masuk dari perangkat ketiga (maksimal 2 perangkat aktif).',
          reason: 'device_limit',
        },
        { status: 401 }
      );
      clearSessionCookie(response);
      return response;
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      nim_nip: true,
      name: true,
      email: true,
      role: true,
      scope_level: true,
      must_change_pwd: true,
      created_at: true,
    },
  });

  if (!user) {
    return NextResponse.json({ user: null }, { status: 404 });
  }

  return NextResponse.json({ user });
}
