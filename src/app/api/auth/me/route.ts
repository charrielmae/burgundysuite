import { NextResponse } from 'next/server';
import { getCurrentAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const adminUser = await getCurrentAdminSession();

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
