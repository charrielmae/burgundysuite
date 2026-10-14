import { NextResponse } from 'next/server';
import { getAdminKPIs } from '@/lib/db';

export async function GET() {
  try {
    const kpis = getAdminKPIs();
    return NextResponse.json({ success: true, data: kpis });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
