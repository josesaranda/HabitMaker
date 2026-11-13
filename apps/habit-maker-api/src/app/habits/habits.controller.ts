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
  findAll(@Req() request: AuthenticatedUserRequest) {
    return this.habitsService.findAll(request.user.id);
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
