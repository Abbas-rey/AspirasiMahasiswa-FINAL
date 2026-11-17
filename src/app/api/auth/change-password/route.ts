import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getSession, signToken, verifyToken, setSessionCookie, TokenPayload } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/security';
import { validatePasswordRules } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { new_password, current_password, temp_token } = body;

    let userId = '';
    let isFirstLogin = false;

    // Check authentication: either via temp_token (during first-login prompt) or active session cookie
    if (temp_token && typeof temp_token === 'string') {
      const tempPayload = await verifyToken(temp_token);
      if (!tempPayload || !tempPayload.id || !tempPayload.temp_auth) {
        return NextResponse.json(
          { error: 'Sesi login sementara telah kedaluwarsa. Silakan login kembali.' },
          { status: 401 }
        );
      }
      userId = tempPayload.id;
      isFirstLogin = true;
    } else {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: 'Sesi tidak valid. Silakan login kembali.' }, { status: 401 });
      }
      userId = session.id;
    }

    const clientIp = getClientIp(request.headers);
    const rateCheck = checkRateLimit(`pwd_change_${userId}_${clientIp}`, 5, 300);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan perubahan password. Tunggu ${rateCheck.retryAfterSeconds} detik.` },
        { status: 429 }
      );
    }

    if (!new_password || typeof new_password !== 'string') {
      return NextResponse.json(
        { error: 'Password baru wajib diisi.' },
        { status: 400 }
      );
    }

    if (new_password.length > 128) {
      return NextResponse.json(
        { error: 'Panjang password melebihi batas maksimal 128 karakter.' },
        { status: 400 }
      );
    }

    // Strict validation: min 8 chars, uppercase, lowercase, number, symbol, no spaces
    const validation = validatePasswordRules(new_password);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || 'Password tidak memenuhi syarat keamanan.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 });
    }

    // Authorization verification:
    // If user is already on a custom password (not first login / must_change_pwd: false),
    // current_password is mandatory and must match.
    if (!user.must_change_pwd && !isFirstLogin) {
      if (!current_password || typeof current_password !== 'string') {
        return NextResponse.json(
          { error: 'Password saat ini wajib diisi untuk verifikasi keamanan.' },
          { status: 400 }
        );
      }

      const isOldMatch = await bcrypt.compare(current_password, user.password_hash);
      if (!isOldMatch) {
        return NextResponse.json(
          { error: 'Password saat ini tidak cocok.' },
          { status: 400 }
        );
      }
    }

    // Salt rounds min 10
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(new_password, salt);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: newHash,
        must_change_pwd: false,
      },
    });

    // Re-sign official session token with must_change_pwd: false
    const newPayload: TokenPayload = {
      id: updatedUser.id,
      nim_nip: updatedUser.nim_nip,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      scope_level: updatedUser.scope_level,
      must_change_pwd: false,
    };

    const token = await signToken(newPayload, '7d');
    const response = NextResponse.json({
      success: true,
      message: 'Password berhasil diperbarui.',
      user: newPayload,
    });

    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui password.' },
      { status: 500 }
    );
  }
}
