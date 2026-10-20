import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { DatabaseService } from '../../database/database.service';
import { AuthenticatedAdmin } from '../../types/database';

export const SESSION_COOKIE_NAME = 'burgundy_admin_session';

interface SessionPayload {
  userId: number;
  userName: string;
  role: 'admin' | 'staff';
  exp: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly secret = process.env.AUTH_SECRET || 'burgundy-luxury-secret-key-2026';

  constructor(private readonly dbService: DatabaseService) {}

  private sign(payload: string): string {
    return crypto.createHmac('sha256', this.secret).update(payload).digest('base64url');
  }

  public createSessionToken(user: AuthenticatedAdmin): string {
    const payload: SessionPayload = {
      userId: user.user_id,
      userName: user.user_name,
      role: user.user_role,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = this.sign(payloadStr);
    return `${payloadStr}.${signature}`;
  }

  public verifySessionToken(token: string): SessionPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 2) return null;
      const [payloadStr, signature] = parts;
      const expectedSig = this.sign(payloadStr);

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

  public async authenticate(username: string, password: string): Promise<AuthenticatedAdmin | null> {
    return this.dbService.authenticateAdmin(username, password);
  }

  public async verifyTurnstile(token: string, ip?: string): Promise<{ success: boolean; error?: string }> {
    const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      return { success: true };
    }

    try {
      const formData = new URLSearchParams();
      formData.append('secret', secretKey);
      formData.append('response', token);
      if (ip) formData.append('remoteip', ip);

      const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const data = await res.json();
      if (data.success) {
        return { success: true };
      }
      return { success: false, error: 'Cloudflare Turnstile verification failed.' };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  public getUserById(userId: number): AuthenticatedAdmin | null {
    return this.dbService.getAdminUserById(userId);
  }
}
