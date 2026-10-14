import { NextResponse } from 'next/server';
import { getCurrentAdminSession, setAdminSession } from '@/lib/auth';
import { verifyCloudflareAccessHeader } from '@/lib/cloudflare-auth';

export async function GET(request: Request) {
  try {
    let adminUser = await getCurrentAdminSession();

    // If not found in session cookie, check if request came through Cloudflare Access (Zero Trust)
    if (!adminUser) {
      const cfUser = await verifyCloudflareAccessHeader(request.headers);
      if (cfUser) {
        adminUser = cfUser;
        await setAdminSession(cfUser);
      }
    }

    if (!adminUser) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      data: adminUser,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, authenticated: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
