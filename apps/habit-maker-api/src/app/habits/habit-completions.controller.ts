import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedUserRequest } from './habits.types';
import { JwtAuthGuard } from './jwt-auth.guard';
import { HabitCompletionsService } from './habit-completions.service';

@Controller('habits/:habitId/completions')
@UseGuards(JwtAuthGuard)
export class HabitCompletionsController {
  constructor(private readonly completions: HabitCompletionsService) {}

  @Get('today')
  findToday(
    @Param('habitId') habitId: string,
    @Query('date') date: string | undefined,
    @Req() request: AuthenticatedUserRequest,
  ) {
    return this.completions.findForDate(
      habitId,
      date ?? this.getUtcToday(),
      request.user.id,
    );
  }

  @Put('today')
  setToday(
    @Param('habitId') habitId: string,
    @Query('date') date: string | undefined,
    @Body() body: unknown,
    @Req() request: AuthenticatedUserRequest,
  ) {
    return this.completions.setCompletion(
      habitId,
      date ?? this.getUtcToday(),
      body,
      request.user.id,
    );
  }

  @Get()
  findAll(
    @Param('habitId') habitId: string,
    @Req() request: AuthenticatedUserRequest,
  ) {
    return this.completions.findAll(habitId, request.user.id);
  }

  @Put(':date')
  setCompletion(
    @Param('habitId') habitId: string,
    @Param('date') date: string,
    @Body() body: unknown,
    @Req() request: AuthenticatedUserRequest,
  ) {
    return this.completions.setCompletion(habitId, date, body, request.user.id);
  }

  private getUtcToday(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
