import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../habits/jwt-auth.guard';
import { AdminEmailService } from './admin-email.service';
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
