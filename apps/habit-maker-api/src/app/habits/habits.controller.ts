import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedUserRequest } from './habits.types';
import { HabitsService } from './habits.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  findAll(
    @Query('includeArchived') includeArchived: string,
    @Req() request: AuthenticatedUserRequest,
  ) {
    return this.habitsService.findAll(
      request.user.id,
      includeArchived === 'true',
    );
  }

  @Get('archived/count')
  countArchived(@Req() request: AuthenticatedUserRequest) {
    return this.habitsService
      .countArchived(request.user.id)
      .then((count) => ({ count }));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: AuthenticatedUserRequest) {
    return this.habitsService.findOne(id, request.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @Req() request: AuthenticatedUserRequest,
  ): Promise<void> {
    return this.habitsService.remove(id, request.user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() request: AuthenticatedUserRequest,
  ) {
    return this.habitsService.update(id, body, request.user.id);
  }

  @Post()
  create(@Body() body: unknown, @Req() request: AuthenticatedUserRequest) {
    return this.habitsService.create(body, request.user.id);
  }

  @Put(':id/archive')
  archive(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() request: AuthenticatedUserRequest,
  ) {
    const archived =
      body && typeof body === 'object'
        ? (body as Record<string, unknown>)['archived']
        : undefined;
    if (typeof archived !== 'boolean') {
      return this.habitsService.archive(id, true, request.user.id);
    }
    return this.habitsService.archive(id, archived, request.user.id);
  }

  @Get(':id/reminder')
  getReminder(
    @Param('id') id: string,
    @Req() request: AuthenticatedUserRequest,
  ) {
    return this.habitsService.getReminder(id, request.user.id);
  }

  @Put(':id/reminder')
  updateReminder(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() request: AuthenticatedUserRequest,
  ) {
    return this.habitsService.updateReminder(id, body, request.user.id);
  }
}
