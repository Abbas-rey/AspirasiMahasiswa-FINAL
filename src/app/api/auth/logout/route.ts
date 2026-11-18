import { NextResponse } from 'next/server';
import { clearSessionCookie, getSession } from '@/lib/auth';
import { revokeSession } from '@/lib/session';

export async function POST() {
  try {
    const session = await getSession();
    if (session && session.session_id) {
      await revokeSession(session.session_id);
    }
  } catch (err) {
    console.error('Logout error revoking session:', err);
  }

  const response = NextResponse.json({
    success: true,
    message: 'Logout berhasil.',
  });
  clearSessionCookie(response);
  return response;
}
