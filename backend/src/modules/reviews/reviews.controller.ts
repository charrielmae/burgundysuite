import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { DatabaseService } from '../../database/database.service';
import { AuthService, SESSION_COOKIE_NAME } from '../auth/auth.service';
import { NewReviewRequest, ReviewReplyRequest } from '../../types/database';

@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly authService: AuthService
  ) {}

  private getStaffOrAdminSession(req: Request) {
    let token = req.cookies?.[SESSION_COOKIE_NAME];
    if (!token && typeof req.headers.authorization === 'string' && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7).trim();
    }
    if (!token && typeof req.headers['x-admin-token'] === 'string') {
      token = req.headers['x-admin-token'];
    }
    if (token) {
      const payload = this.authService.verifySessionToken(token);
      if (payload && (payload.role === 'admin' || payload.role === 'staff')) {
        return payload;
      }
    }
    throw new HttpException(
      { success: false, error: 'Unauthorized. Staff or Admin session required to reply.' },
      HttpStatus.UNAUTHORIZED
    );
  }

  @Get()
  getReviews(
    @Query('roomTypeId') roomTypeId?: string,
    @Query('targetType') targetType?: string
  ) {
    try {
      const parsedRoomTypeId = roomTypeId && roomTypeId !== 'all' ? Number(roomTypeId) : undefined;
      const result = this.dbService.getReviews(parsedRoomTypeId, targetType);
      return { success: true, data: result.reviews, summary: result.summary };
    } catch (error) {
      throw new HttpException(
        { success: false, error: (error as Error).message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post()
  async createReview(@Body() body: NewReviewRequest) {
    try {
      if (!body.guest_name?.trim() || !body.guest_email?.trim() || !body.comment?.trim()) {
        throw new HttpException(
          { success: false, error: 'Guest name, email, and feedback comment are required.' },
          HttpStatus.BAD_REQUEST
        );
      }

      const roomRating = Number(body.room_rating);
      const serviceRating = Number(body.service_rating);
      if (
        !Number.isFinite(roomRating) || roomRating < 1 || roomRating > 5 ||
        !Number.isFinite(serviceRating) || serviceRating < 1 || serviceRating > 5
      ) {
        throw new HttpException(
          { success: false, error: 'Room and service ratings must be between 1 and 5.' },
          HttpStatus.BAD_REQUEST
        );
      }

      const created = await this.dbService.createReview({
        ...body,
        guest_name: body.guest_name.trim(),
        guest_email: body.guest_email.trim().toLowerCase(),
        comment: body.comment.trim(),
        room_rating: Math.round(roomRating),
        service_rating: Math.round(serviceRating),
      });

      return {
        success: true,
        message: 'Thank you for sharing your feedback with Burgundy Suite & Resort!',
        data: created,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { success: false, error: (error as Error).message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(':id/reply')
  async replyToReview(
    @Param('id') id: string,
    @Body() body: ReviewReplyRequest,
    @Req() req: Request
  ) {
    try {
      const session = this.getStaffOrAdminSession(req);
      const reviewId = Number(id);
      if (!reviewId || isNaN(reviewId)) {
        throw new HttpException({ success: false, error: 'Invalid review ID.' }, HttpStatus.BAD_REQUEST);
      }
      if (!body.staff_reply?.trim()) {
        throw new HttpException({ success: false, error: 'Reply message is required.' }, HttpStatus.BAD_REQUEST);
      }

      const user = this.authService.getUserById(session.userId);
      const repliedBy =
        body.replied_by?.trim() ||
        (user ? `${user.first_name} ${user.last_name} (${user.position})` : session.userName);

      const updated = await this.dbService.replyToReview(reviewId, body.staff_reply.trim(), repliedBy);
      if (!updated) {
        throw new HttpException({ success: false, error: 'Review not found.' }, HttpStatus.NOT_FOUND);
      }

      return { success: true, message: 'Response posted successfully.', data: updated };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { success: false, error: (error as Error).message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
