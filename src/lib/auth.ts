import crypto from 'crypto';
import { cookies } from 'next/headers';
import { AuthenticatedAdmin, getAdminUserById } from './db';

const SESSION_COOKIE_NAME = 'burgundy_admin_session';
const SECRET = process.env.AUTH_SECRET || 'burgundy-luxury-secret-key-2026';

interface SessionPayload {
  userId: number;
  userName: string;
  role: 'admin' | 'staff';
  exp: number;
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
}

export function createSessionToken(user: AuthenticatedAdmin): string {
  const payload: SessionPayload = {
    userId: user.user_id,
    userName: user.user_name,
    role: user.user_role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = sign(payloadStr);
  return `${payloadStr}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadStr, signature] = parts;
    const expectedSig = sign(payloadStr);

    if (signature !== expectedSig) {
      return null;
    }

    const json = Buffer.from(payloadStr, 'base64url').toString('utf-8');
    const payload = JSON.parse(json) as SessionPayload;

    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function setAdminSession(user: AuthenticatedAdmin): Promise<void> {
  const token = createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentAdminSession(): Promise<AuthenticatedAdmin | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifySessionToken(token);
    if (!payload) return null;

    return getAdminUserById(payload.userId);
  } catch {
    return null;
  }
}
