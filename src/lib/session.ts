import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, signToken, TokenPayload } from '@/lib/auth';
import { getClientIp } from '@/lib/security';
import { Role, TargetLevel } from '@prisma/client';

export const MAX_CONCURRENT_DEVICES = 2;

export function parseUserAgent(ua: string | null): string {
  if (!ua) return 'Perangkat Tidak Dikenal';
  let os = 'Perangkat Lain';
  if (/windows/i.test(ua)) os = 'Windows PC';
  else if (/macintosh|mac os x/i.test(ua)) os = 'Mac';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  let browser = 'Browser Web';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';

  return `${browser} (${os})`;
}

/**
 * Creates a new active session for a user, enforcing the MAX_CONCURRENT_DEVICES limit.
 * If 2 active sessions already exist, the oldest session is evicted/deleted (FIFO).
 */
export async function createSessionForUser(
  user: {
    id: string;
    nim_nip: string;
    name: string;
    email: string | null;
    role: Role;
    scope_level: TargetLevel | null;
    must_change_pwd: boolean;
  },
  req?: NextRequest
): Promise<{ token: string; payload: TokenPayload; sessionId: string }> {
  // 1. Get existing active sessions for this user, ordered by creation time asc (oldest first)
  const existingSessions = await prisma.userSession.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'asc' },
  });

  // 2. If >= 2 sessions exist, evict the oldest session(s)
  if (existingSessions.length >= MAX_CONCURRENT_DEVICES) {
    const excessCount = existingSessions.length - MAX_CONCURRENT_DEVICES + 1;
    const toEvict = existingSessions.slice(0, excessCount);
    await prisma.userSession.deleteMany({
      where: { id: { in: toEvict.map((s) => s.id) } },
    });
  }

  // 3. Create a unique session identifier
  const sessionId = crypto.randomUUID();
  const ua = req ? req.headers.get('user-agent') : null;
  const ip = req ? getClientIp(req.headers) : null;

  await prisma.userSession.create({
    data: {
      user_id: user.id,
      token_id: sessionId,
      device_info: parseUserAgent(ua),
      ip_address: ip,
    },
  });

  // 4. Issue the JWT with session_id bound
  const payload: TokenPayload = {
    id: user.id,
    nim_nip: user.nim_nip,
    name: user.name,
    email: user.email,
    role: user.role,
    scope_level: user.scope_level,
    must_change_pwd: user.must_change_pwd,
    session_id: sessionId,
  };

  const token = await signToken(payload, '7d');
  return { token, payload, sessionId };
}

/**
 * Checks if a session_id is still active in the database.
 * If missing, it was evicted by another device login.
 */
export async function isSessionActive(sessionId: string): Promise<boolean> {
  if (!sessionId) return false;
  try {
    const session = await prisma.userSession.findUnique({
      where: { token_id: sessionId },
      select: { id: true },
    });
    return !!session;
  } catch (error) {
    console.error('Check session error:', error);
    return true; // Fail-open gracefully on transient DB error
  }
}

/**
 * Revokes a session by token_id (called upon logout)
 */
export async function revokeSession(sessionId: string): Promise<void> {
  if (!sessionId) return;
  try {
    await prisma.userSession.deleteMany({
      where: { token_id: sessionId },
    });
  } catch (error) {
    console.error('Revoke session error:', error);
  }
}

/**
 * Returns the session payload only if the session is still active in the database.
 * If the session was evicted by another device login, returns null.
 */
export async function getValidatedSession(): Promise<TokenPayload | null> {
  const session = await getSession();
  if (!session) return null;
  if (session.session_id) {
    const active = await isSessionActive(session.session_id);
    if (!active) return null;
  }
  return session;
}
