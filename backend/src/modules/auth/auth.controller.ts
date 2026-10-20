import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService, SESSION_COOKIE_NAME } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { username?: string; password?: string; turnstileToken?: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const username = body.username || (body as any).user_name;
    const { password, turnstileToken } = body;

    if (turnstileToken) {
      const turnstileCheck = await this.authService.verifyTurnstile(
        turnstileToken,
        req.ip || req.socket.remoteAddress
      );
      if (!turnstileCheck.success) {
        throw new HttpException(
          { success: false, error: turnstileCheck.error || 'Turnstile verification failed.' },
          HttpStatus.FORBIDDEN
        );
      }
    }

    if (!username || !password) {
      throw new HttpException(
        { success: false, error: 'Username and password are required.' },
        HttpStatus.BAD_REQUEST
      );
    }

    const adminUser = await this.authService.authenticate(username, password);

    if (!adminUser) {
      throw new HttpException(
        {
          success: false,
          error:
            'Invalid credentials. Only authorized Admin & Staff accounts have management access. Guests verify reservations via email on the guest portal.',
        },
        HttpStatus.UNAUTHORIZED
      );
    }

    const token = this.authService.createSessionToken(adminUser);

    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      data: adminUser,
      message: `Welcome back, ${adminUser.first_name} ${adminUser.last_name}!`,
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    return {
      success: true,
      message: 'Signed out successfully.',
    };
  }

  @Get('me')
  async me(@Req() req: Request) {
    // 1. Check HTTP-only cookie
    const token = req.cookies?.[SESSION_COOKIE_NAME];
    if (token) {
      const payload = this.authService.verifySessionToken(token);
      if (payload) {
        const user = this.authService.getUserById(payload.userId);
        if (user) {
          return {
            success: true,
            authenticated: true,
            data: user,
          };
        }
        return {
          success: true,
          authenticated: true,
          data: {
            user_id: payload.userId,
            user_name: payload.userName,
            user_role: payload.role,
            first_name: payload.userName,
            last_name: 'Executive',
            position: 'Administrator',
            contact_number: '+63 917 555 8822',
          },
        };
      }
    }

    // 2. Check Cloudflare Access Zero Trust headers
    const cfEmail = req.headers['cf-access-authenticated-user-email'] as string;
    if (cfEmail) {
      return {
        success: true,
        authenticated: true,
        data: {
          user_id: 1,
          user_name: 'admin_cloudflare',
          user_role: 'admin',
          first_name: 'Cloudflare',
          last_name: 'Verified Admin',
          position: 'Zero Trust Administrator',
          contact_number: '+63 917 555 8822',
        },
      };
    }

    return {
      success: false,
      authenticated: false,
      data: null,
    };
  }
}
