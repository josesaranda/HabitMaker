import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedUserRequest } from '../habits/habits.types';
import { JwtAuthGuard } from '../habits/jwt-auth.guard';
import { PushService } from './push.service';

@Controller('push')
@UseGuards(JwtAuthGuard)
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Get('public-key')
  getPublicKey() {
    return { publicKey: this.pushService.getPublicKey() };
  }

  @Put('subscriptions')
  saveSubscription(
    @Body() body: unknown,
    @Req() request: AuthenticatedUserRequest,
  ) {
    return this.pushService.saveSubscription(body, request.user.id);
  }

  @Delete('subscriptions')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeSubscription(
    @Body() body: unknown,
    @Req() request: AuthenticatedUserRequest,
  ): Promise<void> {
    return this.pushService.removeSubscription(body, request.user.id);
  }
}
