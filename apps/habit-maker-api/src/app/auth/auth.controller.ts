import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { JwtAuthGuard } from '../habits/jwt-auth.guard';
import { AuthenticatedUserRequest } from '../habits/habits.types';

interface AuthRequest extends AuthenticatedUserRequest {
  headers: { 'user-agent'?: string | string[] };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('signup')
  signup(@Body() body: unknown, @Req() request: AuthRequest) {
    return this.authService.signup(body, this.getUserAgent(request));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: unknown, @Req() request: AuthRequest) {
    return this.authService.login(body, this.getUserAgent(request));
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() body: unknown) {
    return this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() body: unknown) {
    return this.authService.resetPassword(body);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  listSessions(@Req() request: AuthRequest) {
    return this.sessionService.listForUser(
      request.user.id,
      request.user.sessionId,
    );
  }

  @Delete('sessions/current')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  revokeCurrentSession(@Req() request: AuthRequest): Promise<void> {
    return this.sessionService.revoke(request.user.id, request.user.sessionId);
  }

  @Delete('sessions/others')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  revokeOtherSessions(@Req() request: AuthRequest): Promise<void> {
    return this.sessionService.revokeOthers(
      request.user.id,
      request.user.sessionId,
    );
  }

  @Delete('sessions/:sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  revokeSession(
    @Param('sessionId') sessionId: string,
    @Req() request: AuthRequest,
  ): Promise<void> {
    return this.sessionService.revoke(request.user.id, sessionId);
  }

  private getUserAgent(request: AuthRequest): string | undefined {
    const userAgent = request.headers['user-agent'];
    return Array.isArray(userAgent) ? userAgent[0] : userAgent;
  }
}
