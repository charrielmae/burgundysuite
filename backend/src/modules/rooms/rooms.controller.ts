import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { NewRoomTypeRequest, RoomStatus } from '../../types/database';

@Controller()
export class RoomsController {
  constructor(private readonly dbService: DatabaseService) {}

  @Get('rooms/availability')
  checkAvailability(
    @Query('checkIn') checkIn?: string,
    @Query('checkOut') checkOut?: string,
    @Query('roomTypeId') roomTypeId?: string
  ) {
    try {
      const today = new Date();
      const defaultIn = checkIn || new Date(today.getTime() + 86400000).toISOString().split('T')[0];
      const defaultOut = checkOut || new Date(today.getTime() + 4 * 86400000).toISOString().split('T')[0];
      const parsedTypeId = roomTypeId && roomTypeId !== 'all' ? Number(roomTypeId) : undefined;

      const data = this.dbService.checkRoomAvailability(defaultIn, defaultOut, parsedTypeId);
      return { success: true, data };
    } catch (error) {
      throw new HttpException(
        { success: false, error: (error as Error).message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('rooms')
  getRooms() {
    try {
      const rooms = this.dbService.getRooms();
      return { success: true, data: rooms };
    } catch (error) {
      throw new HttpException(
        { success: false, error: (error as Error).message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch('rooms')
  async updateRoomStatus(@Body() body: { room_id?: number; status?: RoomStatus }) {
    try {
      const { room_id, status } = body;
      if (!room_id || !status) {
        throw new HttpException(
          { success: false, error: 'room_id and status are required' },
          HttpStatus.BAD_REQUEST
        );
      }

      const updated = await this.dbService.updateRoomStatus(Number(room_id), status);
      if (!updated) {
        throw new HttpException(
          { success: false, error: 'Room not found' },
          HttpStatus.NOT_FOUND
        );
      }

      return { success: true, data: updated };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { success: false, error: (error as Error).message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('room-types')
  getRoomTypes() {
    try {
      const types = this.dbService.getRoomTypes();
      return { success: true, data: types };
    } catch (error) {
      throw new HttpException(
        { success: false, error: (error as Error).message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('room-types')
  async createRoomType(@Body() body: NewRoomTypeRequest) {
    try {
      if (!body.room_type || !body.room_type.trim()) {
        throw new HttpException(
          { success: false, error: 'Suite / Room name is required' },
          HttpStatus.BAD_REQUEST
        );
      }

      if (!body.rate_per_night || Number(body.rate_per_night) <= 0) {
        throw new HttpException(
          { success: false, error: 'Valid nightly rate (₱) is required' },
          HttpStatus.BAD_REQUEST
        );
      }

      if (!body.room_capacity || Number(body.room_capacity) <= 0) {
        throw new HttpException(
          { success: false, error: 'Valid guest capacity is required' },
          HttpStatus.BAD_REQUEST
        );
      }

      const result = await this.dbService.createRoomType({
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

      return {
        success: true,
        message: `Suite "${result.roomType.room_type}" created successfully and added to guest inventory.`,
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { success: false, error: (error as Error).message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
