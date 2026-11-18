import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Role, TargetLevel } from '@prisma/client';

export const COOKIE_NAME = 'asma_session';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  const secretString =
    secret && secret.trim().length >= 16
      ? secret.trim()
      : 'asma_uin_syarif_hidayatullah_default_secure_jwt_secret_key_32chars_min';
  return new TextEncoder().encode(secretString);
}

export const secretKey = getJwtSecret();

export interface TokenPayload {
  id: string;
  nim_nip: string;
  name: string;
  email: string | null;
  role: Role;
  scope_level: TargetLevel | null;
  must_change_pwd: boolean;
  session_id?: string;
  [key: string]: unknown;
}

export async function signToken(payload: TokenPayload, expiresIn: string = '7d'): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    });
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
