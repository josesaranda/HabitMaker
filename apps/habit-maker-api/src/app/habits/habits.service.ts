import {
  BadRequestException,
  Injectable,
  NotFoundException,
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

export interface HabitReminder {
  enabled: boolean;
  time: string | null;
  timeZone: string | null;
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

  async findAll(userId: string): Promise<CreatedHabit[]> {
    const habits = await this.habits.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    return habits.map(({ id, name, createdAt, updatedAt }) => ({
      id,
      name,
      createdAt,
      updatedAt,
    }));
  }

  async findOne(id: string, userId: string): Promise<CreatedHabit> {
    const habit = await this.habits.findOne({
      where: { id, user: { id: userId } },
    });

    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    return {
      id: habit.id,
      name: habit.name,
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt,
    };
  }

  async update(
    id: string,
    input: unknown,
    userId: string,
  ): Promise<CreatedHabit> {
    const name = this.parseName(input);
    const habit = await this.findOwnedHabit(id, userId);

    habit.name = name;
    await this.habits.save(habit);

    return {
      id: habit.id,
      name: habit.name,
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt,
    };
  }

  async remove(id: string, userId: string): Promise<void> {
    const habit = await this.habits.findOne({
      where: { id, user: { id: userId } },
    });

    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    await this.habits.remove(habit);
  }

  async getReminder(id: string, userId: string): Promise<HabitReminder> {
    const habit = await this.findOwnedHabit(id, userId);
    return this.toReminder(habit);
  }

  async updateReminder(
    id: string,
    input: unknown,
    userId: string,
  ): Promise<HabitReminder> {
    if (!input || typeof input !== 'object') {
      throw new BadRequestException('A request body is required');
    }

    const value = input as Record<string, unknown>;
    if (typeof value['enabled'] !== 'boolean') {
      throw new BadRequestException('A boolean enabled value is required');
    }

    const habit = await this.findOwnedHabit(id, userId);
    if (value['enabled']) {
      const time = value['time'];
      const timeZone = value['timeZone'];
      if (typeof time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
        throw new BadRequestException(
          'A reminder time in HH:mm format is required',
        );
      }
      if (
        typeof timeZone !== 'string' ||
        timeZone.length > 100 ||
        !this.isValidTimeZone(timeZone)
      ) {
        throw new BadRequestException('A valid IANA time zone is required');
      }
      habit.reminderEnabled = true;
      habit.reminderTime = time;
      habit.reminderTimeZone = timeZone;
    } else {
      habit.reminderEnabled = false;
    }

    await this.habits.save(habit);
    return this.toReminder(habit);
  }

  private async findOwnedHabit(
    id: string,
    userId: string,
  ): Promise<HabitEntity> {
    const habit = await this.habits.findOne({
      where: { id, user: { id: userId } },
    });
    if (!habit) throw new NotFoundException('Habit not found');
    return habit;
  }

  private toReminder(habit: HabitEntity): HabitReminder {
    return {
      enabled: habit.reminderEnabled ?? false,
      time: habit.reminderTime ?? null,
      timeZone: habit.reminderTimeZone ?? null,
    };
  }

  private isValidTimeZone(timeZone: string): boolean {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone }).format();
      return true;
    } catch {
      return false;
    }
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
