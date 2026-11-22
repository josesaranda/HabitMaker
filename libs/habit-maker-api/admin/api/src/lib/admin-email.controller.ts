import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  JwtAuthGuard,
  type AuthenticatedUserRequest,
} from '@habit-maker/api-auth-api';
import { AdminEmailService } from '@habit-maker/api-admin-infrastructure';
import { AdminRoleGuard } from './admin-role.guard';

interface TestEmailRequest {
  email?: unknown;
}

@Controller('admin/email')
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminEmailController {
  constructor(private readonly adminEmailService: AdminEmailService) {}

  @Get('configuration')
  getConfiguration() {
    return this.adminEmailService.getConfiguration();
  }

  @Put('configuration')
  updateConfiguration(
    @Body() body: unknown,
    @Req() request: AuthenticatedUserRequest,
  ) {
    return this.adminEmailService.updateConfiguration(body, request.user.id);
  }

  @Post('test')
  async sendTestEmail(@Body() body: TestEmailRequest) {
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('A valid recipient email is required');
    }

    await this.adminEmailService.sendTestEmail(email);
    return { success: true };
  }
}
