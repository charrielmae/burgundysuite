import { NextResponse } from 'next/server';
import { getPayments } from '@/lib/db';

export async function GET() {
  try {
    const payments = getPayments();
    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
