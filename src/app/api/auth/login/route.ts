import { NextResponse } from 'next/server';
import { authenticateAdminWithCloudflare, verifyCloudflareTurnstile } from '@/lib/cloudflare-auth';
import { setAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, turnstileToken } = body;

    // Optional Cloudflare Turnstile bot verification
    if (turnstileToken) {
      const turnstileCheck = await verifyCloudflareTurnstile(turnstileToken);
      if (!turnstileCheck.success) {
        return NextResponse.json(
          { success: false, error: turnstileCheck.error || 'Turnstile verification failed.' },
          { status: 403 }
        );
      }
    }

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    // Authenticate against Cloudflare D1 Database (with local fallback)
    const adminUser = await authenticateAdminWithCloudflare(username, password);

    if (!adminUser) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid credentials. Only authorized Admin & Staff accounts have management access. Guests verify reservations via email on the guest portal.',
        },
        { status: 401 }
      );
    }

    // Set HTTP-only secure cookie
    await setAdminSession(adminUser);

    return NextResponse.json({
      success: true,
      data: adminUser,
      message: `Welcome back, ${adminUser.first_name} ${adminUser.last_name}!`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
