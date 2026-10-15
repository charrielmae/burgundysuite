import { NextResponse } from 'next/server';
import { getStaffAccounts, createStaffAccount } from '@/lib/db';
import { getCurrentAdminSession } from '@/lib/auth';
import { NewAccountRequest } from '@/types/database';

export async function GET() {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin session required.' },
        { status: 401 }
      );
    }

    const accounts = getStaffAccounts();
    return NextResponse.json({ success: true, data: accounts });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentAdminSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Only logged-in administrators can create accounts.' },
        { status: 401 }
      );
    }

    if (session.user_role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden. Only administrators have permission to provision new accounts.' },
        { status: 403 }
      );
    }

    const body: NewAccountRequest = await request.json();

    if (!body.user_name || !body.user_name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Username is required.' },
        { status: 400 }
      );
    }

    if (!body.password || body.password.trim().length < 4) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 4 characters.' },
        { status: 400 }
      );
    }

    if (!body.first_name?.trim() || !body.last_name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'First name and last name are required.' },
        { status: 400 }
      );
    }

    if (!body.position?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Staff position / department title is required.' },
        { status: 400 }
      );
    }

    const created = await createStaffAccount({
      user_name: body.user_name.trim(),
      password: body.password.trim(),
      user_role: body.user_role === 'admin' ? 'admin' : 'staff',
      first_name: body.first_name.trim(),
      last_name: body.last_name.trim(),
      position: body.position.trim(),
      contact_number: body.contact_number?.trim() || '+63 917 000 0000',
    });

    return NextResponse.json({
      success: true,
      message: `Account for ${created.first_name} ${created.last_name} (${created.user_role}) created successfully!`,
      data: created,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
