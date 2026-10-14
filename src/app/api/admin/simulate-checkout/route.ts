import { NextResponse } from 'next/server';
import { simulateDueCheckouts } from '@/lib/db';

export async function POST() {
  try {
    const result = await simulateDueCheckouts();
    return NextResponse.json({
      success: true,
      message: `Simulated checkout for ${result.count} due room(s).`,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
