import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository } from 'typeorm';
import { UserEntity } from '../auth/user.entity';
import { HabitEntity } from './habit.entity';

export interface CreatedHabit {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class HabitsService {
  constructor(
    @InjectRepository(HabitEntity)
    private readonly habits: Repository<HabitEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async create(input: unknown, userId: string): Promise<CreatedHabit> {
    const name = this.parseName(input);
    const user = await this.users.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException(
        'The authenticated user no longer exists',
      );
    }

    const habit = await this.habits.save(
      this.habits.create({ id: randomUUID(), name, user }),
    );

    return {
      id: habit.id,
      name: habit.name,
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt,
    };
  }

  private parseName(input: unknown): string {
    if (!input || typeof input !== 'object') {
      throw new BadRequestException('A request body is required');
    }

    const name = (input as Record<string, unknown>)['name'];
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new BadRequestException('A habit name is required');
    }

    const normalizedName = name.trim();
    if (normalizedName.length > 100) {
      throw new BadRequestException(
        'A habit name must be 100 characters or less',
      );
    }

    return normalizedName;
  }
}
