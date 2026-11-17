import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken, setSessionCookie, TokenPayload } from '@/lib/auth';
import { checkRateLimit, resetRateLimit, getClientIp, sanitizeText } from '@/lib/security';

// Pre-computed dummy hash to prevent timing attacks when user does not exist
const DUMMY_HASH = '$2a$10$e8w.bWvR0sV7pI9yMsqWqeS0tX00RvhLdIhzE9j4t65jEKn5nF22.';

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request.headers);
    const rateLimitKey = `login_${clientIp}`;

    // Max 10 login attempts per IP per 5 minutes
    const rateCheck = checkRateLimit(rateLimitKey, 10, 300);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan login gagal. Silakan tunggu ${rateCheck.retryAfterSeconds} detik sebelum mencoba lagi.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateCheck.retryAfterSeconds.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { nim_nip, password } = body;

    if (!nim_nip || !password || typeof nim_nip !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'NIM / NIP dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const trimmedIdentifier = sanitizeText(nim_nip);
    if (trimmedIdentifier.length > 50 || password.length > 128) {
      return NextResponse.json(
        { error: 'Format data login tidak valid.' },
        { status: 400 }
      );
    }

    // Find user by nim_nip or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { nim_nip: trimmedIdentifier },
          { email: trimmedIdentifier.toLowerCase() },
        ],
      },
    });

    // Constant-time execution: compare against actual hash if found, or dummy hash if not
    const hashToCompare = user ? user.password_hash : DUMMY_HASH;
    const isMatch = await bcrypt.compare(password, hashToCompare);

    if (!user || !isMatch) {
      // Uniform generic error to prevent user enumeration
      return NextResponse.json(
        { error: 'NIM/NIP atau password tidak valid. Silakan periksa kembali kredensial Anda.' },
        { status: 401 }
      );
    }

    // Login success -> reset rate limiter
    resetRateLimit(rateLimitKey);

    // Auto-detect default password:
    // If user entered default password or must_change_pwd is true, enforce password update modal
    const isUsingDefault =
      user.must_change_pwd ||
      password === `Uin${user.nim_nip.trim()}` ||
      (user.nim_nip === 'admin' && (password === 'admin123' || password === 'Uinadmin'));

    if (isUsingDefault && !user.must_change_pwd) {
      await prisma.user.update({
        where: { id: user.id },
        data: { must_change_pwd: true },
      });
    }

    const payload: TokenPayload = {
      id: user.id,
      nim_nip: user.nim_nip,
      name: user.name,
      email: user.email,
      role: user.role,
      scope_level: user.scope_level,
      must_change_pwd: Boolean(isUsingDefault),
    };

    // If user is still using default password:
    // DO NOT set the session cookie yet!
    // Return a short-lived temporary token so that if the user refreshes /login,
    // they remain completely logged out on the login page without any active session.
    if (isUsingDefault) {
      const tempToken = await signToken(
        { ...payload, temp_auth: true },
        '15m'
      );

      return NextResponse.json({
        success: true,
        require_change_pwd: true,
        temp_token: tempToken,
        user: payload,
      });
    }

    // Normal login: issue permanent session cookie
    const token = await signToken(payload, '7d');
    const response = NextResponse.json({
      success: true,
      require_change_pwd: false,
      message: 'Login berhasil.',
      user: payload,
    });

    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat proses login.' },
      { status: 500 }
    );
  }
}
