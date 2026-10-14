import { NextResponse } from 'next/server';
import { resetDatabase } from '@/lib/db';

export async function POST() {
  try {
    resetDatabase();
    return NextResponse.json({
      success: true,
      message: 'Database successfully restored to original seed state.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
