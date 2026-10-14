import { NextResponse } from 'next/server';
import { getRooms, updateRoomStatus } from '@/lib/db';
import { RoomStatus } from '@/types/database';

export async function GET() {
  try {
    const rooms = getRooms();
    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { room_id, status } = body;

    if (!room_id || !status) {
      return NextResponse.json(
        { success: false, error: 'room_id and status are required' },
        { status: 400 }
      );
    }

    const updated = updateRoomStatus(Number(room_id), status as RoomStatus);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
