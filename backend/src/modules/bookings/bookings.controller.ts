import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { NewBookingRequest } from '../../types/database';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly dbService: DatabaseService) {}

  @Get()
  getBookings(
    @Query('filter') filter?: 'all' | 'active' | 'upcoming' | 'completed',
    @Query('email') email?: string
  ) {
    try {
      if (email) {
        const guestBookings = this.dbService.getBookingsByEmail(email);
        return { success: true, data: guestBookings };
      }

      const bookings = this.dbService.getBookings(filter || 'all');
      return { success: true, data: bookings };
    } catch (error) {
      throw new HttpException(
        { success: false, error: (error as Error).message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  async createBooking(@Body() body: NewBookingRequest) {
    try {
      if (
        !body.room_type_id ||
        !body.check_in_date ||
        !body.check_out_date ||
        !body.guest_first_name ||
        !body.guest_last_name ||
        !body.guest_email ||
        !body.guest_contact_number
      ) {
        throw new HttpException(
          { success: false, error: 'Missing required reservation parameters' },
          HttpStatus.BAD_REQUEST
        );
      }

      const result = await this.dbService.createBooking(body);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { success: false, error: (error as Error).message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':id/checkout')
  async checkout(@Param('id') id: string) {
    try {
      const bookingId = Number(id);
      if (!bookingId || isNaN(bookingId)) {
        throw new HttpException(
          { success: false, error: 'Invalid booking ID' },
          HttpStatus.BAD_REQUEST
        );
      }

      const updated = await this.dbService.processCheckOut(bookingId);
      if (!updated) {
        throw new HttpException(
          { success: false, error: 'Booking not found' },
          HttpStatus.NOT_FOUND
        );
      }

      return {
        success: true,
        message: `Booking #${bookingId} checked out successfully. Room #${updated.room.room_number} is now Available.`,
        data: updated,
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
