import { NextResponse } from 'next/server';
import { getBookings, getBookingsByEmail, createBooking } from '@/lib/db';
import { NewBookingRequest } from '@/types/database';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') as 'all' | 'active' | 'upcoming' | 'completed' | null;
    const email = searchParams.get('email');

    if (email) {
      const guestBookings = getBookingsByEmail(email);
      return NextResponse.json({ success: true, data: guestBookings });
    }

    const bookings = getBookings(filter || 'all');
    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body: NewBookingRequest = await req.json();

    // Basic validation
    if (
      !body.room_type_id ||
      !body.check_in_date ||
      !body.check_out_date ||
      !body.guest_first_name ||
      !body.guest_last_name ||
      !body.guest_email ||
      !body.guest_contact_number
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required reservation parameters' },
        { status: 400 }
      );
    }

    const result = await createBooking(body);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
