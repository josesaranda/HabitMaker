import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { In, Repository } from 'typeorm';
import { HabitEntity } from './habit.entity';
import { HabitCompletionEntity } from './habit-completion.entity';

export interface HabitCompletionStatus {
  date: string;
  completed: boolean;
  completedAt: Date | null;
}

@Injectable()
export class HabitCompletionsService {
  constructor(
    @InjectRepository(HabitEntity)
    private readonly habits: Repository<HabitEntity>,
    @InjectRepository(HabitCompletionEntity)
    private readonly completions: Repository<HabitCompletionEntity>,
  ) {}

  async findForDate(
    habitId: string,
    dateInput: unknown,
    userId: string,
  ): Promise<HabitCompletionStatus> {
    const date = this.parseDate(dateInput);
    await this.findOwnedHabit(habitId, userId);
    const completion = await this.completions.findOne({
      where: { habit: { id: habitId }, date },
    });

    return {
      date,
      completed: completion?.completed ?? false,
      completedAt: completion?.completedAt ?? null,
    };
  }

  async findAll(
    habitId: string,
    userId: string,
  ): Promise<HabitCompletionEntity[]> {
    await this.findOwnedHabit(habitId, userId);

    return this.completions.find({
      where: { habit: { id: habitId } },
      order: { date: 'DESC' },
    });
  }

  async findForDates(
    habitId: string,
    datesInput: unknown,
    userId: string,
  ): Promise<HabitCompletionStatus[]> {
    const dates = this.parseDates(datesInput);
    await this.findOwnedHabit(habitId, userId);
    const completions = await this.completions.find({
      where: { habit: { id: habitId }, date: In(dates) },
    });
    const completionsByDate = new Map(
      completions.map((completion) => [completion.date, completion]),
    );

    return dates.map((date) => {
      const completion = completionsByDate.get(date);
      return {
        date,
        completed: completion?.completed ?? false,
        completedAt: completion?.completedAt ?? null,
      };
    });
  }

  async setCompletion(
    habitId: string,
    dateInput: unknown,
    input: unknown,
    userId: string,
  ): Promise<HabitCompletionEntity> {
    const date = this.parseDate(dateInput);
    const completed = this.parseCompleted(input);
    const habit = await this.findOwnedHabit(habitId, userId);
    const existing = await this.completions.findOne({
      where: { habit: { id: habitId }, date },
    });

    const completion =
      existing ??
      this.completions.create({
        id: randomUUID(),
        habit,
        date,
      });
    completion.completed = completed;
    completion.completedAt = completed ? new Date() : null;

    return this.completions.save(completion);
  }

  private async findOwnedHabit(
    habitId: string,
    userId: string,
  ): Promise<HabitEntity> {
    const habit = await this.habits.findOne({
      where: { id: habitId, user: { id: userId } },
    });

    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    return habit;
  }

  private parseDate(input: unknown): string {
    if (typeof input !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      throw new BadRequestException('A date in YYYY-MM-DD format is required');
    }

    const [year, month, day] = input.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      throw new BadRequestException('The date is invalid');
    }

    return input;
  }

  private parseDates(input: unknown): string[] {
    if (typeof input !== 'string') {
      throw new BadRequestException(
        'A comma-separated dates value is required',
      );
    }

    const requestedDates = input.split(',');
    if (
      requestedDates.length === 0 ||
      requestedDates.length > 31 ||
      requestedDates.some((date) => date.length === 0)
    ) {
      throw new BadRequestException('Request between 1 and 31 dates');
    }

    return [...new Set(requestedDates.map((date) => this.parseDate(date)))];
  }

  private parseCompleted(input: unknown): boolean {
    if (!input || typeof input !== 'object') {
      throw new BadRequestException('A request body is required');
    }

    const completed = (input as Record<string, unknown>)['completed'];
    if (typeof completed !== 'boolean') {
      throw new BadRequestException('A boolean completed value is required');
    }

    return completed;
  }
}
