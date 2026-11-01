import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
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

  @Post()
  create(@Body() body: unknown, @Req() request: AuthenticatedUserRequest) {
    return this.habitsService.create(body, request.user.id);
  }
}
