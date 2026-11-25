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
import type { AuthenticatedUserRequest } from '@habit-maker/api-auth-api';
import { JwtAuthGuard } from '@habit-maker/api-auth-api';
import { HabitCompletionsService } from '@habit-maker/api-habits-application';

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

  /**
   * @deprecated Use `from` and `to` query parameters instead of `dates`.
   */
  @Get()
  findAll(
    @Param('habitId') habitId: string,
    @Query('dates') dates: string | undefined,
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Req() request: AuthenticatedUserRequest,
  ) {
    if (from !== undefined && to !== undefined) {
      return this.completions.findForRange(habitId, from, to, request.user.id);
    }

    if (dates !== undefined) {
      return this.completions.findForDates(habitId, dates, request.user.id);
    }

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
