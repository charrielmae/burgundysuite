import { NextResponse } from 'next/server';
import { getRoomTypes, createRoomType } from '@/lib/db';
import { NewRoomTypeRequest } from '@/types/database';

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

export async function POST(request: Request) {
  try {
    const body: NewRoomTypeRequest = await request.json();

    if (!body.room_type || !body.room_type.trim()) {
      return NextResponse.json(
        { success: false, error: 'Suite / Room name is required' },
        { status: 400 }
      );
    }

    if (!body.rate_per_night || Number(body.rate_per_night) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid nightly rate (₱) is required' },
        { status: 400 }
      );
    }

    if (!body.room_capacity || Number(body.room_capacity) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid guest capacity is required' },
        { status: 400 }
      );
    }

    const result = await createRoomType({
      room_type: body.room_type.trim(),
      room_capacity: Number(body.room_capacity),
      rate_per_night: Number(body.rate_per_night),
      description:
        body.description?.trim() ||
        'Spacious coastal retreat with breathtaking views and bespoke luxury appointments.',
      image_url:
        body.image_url?.trim() ||
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      badge: body.badge?.trim() || `Up to ${body.room_capacity} Guests`,
      features:
        Array.isArray(body.features) && body.features.length > 0
          ? body.features.filter((f) => Boolean(f?.trim()))
          : ['Balcony with Sea Breeze', 'En-suite Rain Shower', 'Artisanal Mini Bar'],
    });

    return NextResponse.json({
      success: true,
      message: `Suite "${result.roomType.room_type}" created successfully and added to guest inventory.`,
      data: result,
    });
  } catch (error) {
    console.error('Error creating suite room type:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

