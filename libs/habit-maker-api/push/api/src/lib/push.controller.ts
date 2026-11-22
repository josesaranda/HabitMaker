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
import type { AuthenticatedUserRequest } from '@habit-maker/api-auth-api';
import { JwtAuthGuard } from '@habit-maker/api-auth-api';
import { PushService } from '@habit-maker/api-push-application';

@Controller('push')
@UseGuards(JwtAuthGuard)
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Get('public-key')
  async getPublicKey() {
    return { publicKey: await this.pushService.getPublicKey() };
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
