import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, setSessionCookie, TokenPayload } from '@/lib/auth';
import { createSessionForUser } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { temp_token } = await request.json();

    if (!temp_token || typeof temp_token !== 'string') {
      return NextResponse.json(
        { error: 'Token otentikasi sementara tidak ditemukan. Silakan login kembali.' },
        { status: 400 }
      );
    }

    const payload = await verifyToken(temp_token);
    if (!payload || !payload.id || !payload.temp_auth) {
      return NextResponse.json(
        { error: 'Sesi login sementara telah kedaluwarsa. Silakan login kembali.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    // User explicitly chose "Nanti" to postpone changing their default password.
    // Issue official session cookie enforcing max 2 devices
    const { token, payload: sessionPayload } = await createSessionForUser(
      {
        id: user.id,
        nim_nip: user.nim_nip,
        name: user.name,
        email: user.email,
        role: user.role,
        scope_level: user.scope_level,
        must_change_pwd: true,
      },
      request
    );

    const response = NextResponse.json({
      success: true,
      message: 'Berhasil masuk ke dasbor.',
      user: sessionPayload,
    });

    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Skip first change error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat memproses sesi.' },
      { status: 500 }
    );
  }
}
