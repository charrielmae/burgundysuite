import { NextResponse } from 'next/server';
import { getRoomTypes } from '@/lib/db';

export async function GET() {
  try {
    const types = getRoomTypes();
    return NextResponse.json({ success: true, data: types });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
