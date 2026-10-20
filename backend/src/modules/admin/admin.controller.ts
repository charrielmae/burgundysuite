import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Body,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { DatabaseService } from '../../database/database.service';
import { AuthService, SESSION_COOKIE_NAME } from '../auth/auth.service';
import { NewAccountRequest, UpdateAccountRequest } from '../../types/database';

@Controller()
export class AdminController {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly authService: AuthService
  ) {}

  private getSessionOrThrow(req: Request) {
    let token = req.cookies?.[SESSION_COOKIE_NAME];
    if (!token && typeof req.headers.authorization === 'string' && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7).trim();
    }
    if (!token && typeof req.headers['x-admin-token'] === 'string') {
      token = req.headers['x-admin-token'];
    }

    if (token) {
      const payload = this.authService.verifySessionToken(token);
      if (payload) {
        return payload;
      }
    }

    const cfEmail = req.headers['cf-access-authenticated-user-email'];
    if (cfEmail) {
      return { userId: 1, userName: 'admin_cloudflare', role: 'admin' };
    }

    throw new HttpException(
      { success: false, error: 'Unauthorized. Admin session required. Please sign in.' },
      HttpStatus.UNAUTHORIZED
    );
  }

  @Get('admin/metrics')
  getMetrics() {
    try {
      const kpis = this.dbService.getAdminKPIs();
      return { success: true, data: kpis };
    } catch (error) {
      throw new HttpException(
        { success: false, error: (error as Error).message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('admin/accounts')
  getAccounts(@Req() req: Request) {
    try {
      this.getSessionOrThrow(req);
      const accounts = this.dbService.getStaffAccounts();
      return { success: true, data: accounts };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { success: false, error: (error as Error).message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('admin/accounts')
  async createAccount(@Body() body: NewAccountRequest, @Req() req: Request) {
    try {
      this.getSessionOrThrow(req);

      if (!body.user_name || !body.user_name.trim()) {
        throw new HttpException(
          { success: false, error: 'Username is required.' },
          HttpStatus.BAD_REQUEST
        );
      }

      if (!body.password || body.password.trim().length < 4) {
        throw new HttpException(
          { success: false, error: 'Password must be at least 4 characters.' },
          HttpStatus.BAD_REQUEST
        );
      }

      if (!body.first_name?.trim() || !body.last_name?.trim()) {
        throw new HttpException(
          { success: false, error: 'First name and last name are required.' },
          HttpStatus.BAD_REQUEST
        );
      }

      if (!body.position?.trim()) {
        throw new HttpException(
          { success: false, error: 'Staff position / department title is required.' },
          HttpStatus.BAD_REQUEST
        );
      }

      const created = await this.dbService.createStaffAccount({
        user_name: body.user_name.trim(),
        password: body.password.trim(),
        user_role: body.user_role === 'admin' ? 'admin' : 'staff',
        first_name: body.first_name.trim(),
        last_name: body.last_name.trim(),
        position: body.position.trim(),
        contact_number: body.contact_number?.trim() || '+63 917 000 0000',
      });

      return {
        success: true,
        message: `Account for ${created.first_name} ${created.last_name} (${created.user_role}) created successfully!`,
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

  @Put('admin/accounts')
  async updateAccount(@Body() body: UpdateAccountRequest, @Req() req: Request) {
    try {
      this.getSessionOrThrow(req);

      if (!body.user_id) {
        throw new HttpException(
          { success: false, error: 'User ID is required.' },
          HttpStatus.BAD_REQUEST
        );
      }

      const updated = await this.dbService.updateStaffAccount(body);
      return {
        success: true,
        message: `Staff account for ${updated.first_name} ${updated.last_name} updated successfully!`,
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

  @Delete('admin/accounts')
  async deleteAccount(@Query('id') id: string, @Req() req: Request) {
    try {
      const session = this.getSessionOrThrow(req);
      const userId = Number(id);

      if (!userId || isNaN(userId)) {
        throw new HttpException(
          { success: false, error: 'Valid staff user ID is required.' },
          HttpStatus.BAD_REQUEST
        );
      }

      if (session.userId === userId) {
        throw new HttpException(
          { success: false, error: 'You cannot delete your own active administrator account.' },
          HttpStatus.BAD_REQUEST
        );
      }

      await this.dbService.deleteStaffAccount(userId);
      return {
        success: true,
        message: `Staff account #${userId} has been successfully removed.`,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { success: false, error: (error as Error).message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('admin/reset')
  reset() {
    try {
      this.dbService.resetDatabase();
      return {
        success: true,
        message: 'Database successfully restored to original seed state.',
      };
    } catch (error) {
      throw new HttpException(
        { success: false, error: (error as Error).message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('admin/simulate-checkout')
  async simulateCheckout() {
    try {
      const result = await this.dbService.simulateDueCheckouts();
      return {
        success: true,
        message: `Simulated checkout for ${result.count} due room(s).`,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, error: (error as Error).message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('payments')
  getPayments() {
    try {
      const db = this.dbService.readDb();
      const sorted = (db.PAYMENT_DETAILS || []).slice().sort((a, b) => b.payment_id - a.payment_id);
      return { success: true, data: sorted };
    } catch (error) {
      throw new HttpException(
        { success: false, error: (error as Error).message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
