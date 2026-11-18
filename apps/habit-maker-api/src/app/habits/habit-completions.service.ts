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

export interface HabitCompletionUpdate extends HabitCompletionStatus {
  currentStreak: number;
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function getPreviousDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const previous = new Date(Date.UTC(year, month - 1, day - 1));
  return previous.toISOString().slice(0, 10);
}

/**
 * Counts the consecutive completed days ending today (or yesterday when today
 * is still in progress). The first missed day breaks the chain and the streak
 * restarts from zero.
 */
export function calculateStreak(
  completedDates: readonly string[],
  today: string,
): number {
  const completed = new Set(completedDates.filter((date) => date <= today));
  let cursor = completed.has(today) ? today : getPreviousDate(today);
  if (!completed.has(cursor)) return 0;

  let streak = 0;
  while (completed.has(cursor)) {
    streak += 1;
    cursor = getPreviousDate(cursor);
  }
  return streak;
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
  ): Promise<HabitCompletionUpdate> {
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
    const saved = await this.completions.save(completion);

    return {
      date: saved.date,
      completed: saved.completed,
      completedAt: saved.completedAt,
      currentStreak: await this.getStreakForHabit(habitId),
    };
  }

  /**
   * Consecutive completed days ending today (or yesterday while today is
   * still in progress). A single missed day resets the streak to zero.
   */
  async getStreak(habitId: string, userId: string): Promise<number> {
    await this.findOwnedHabit(habitId, userId);
    return this.getStreakForHabit(habitId);
  }

  /** Current streak for every habit of a user, keyed by habit id. */
  async findStreaksByUser(userId: string): Promise<Map<string, number>> {
    const completions = await this.completions
      .createQueryBuilder('completion')
      .select('habit.id', 'habitId')
      .addSelect('completion.date', 'date')
      .innerJoin('completion.habit', 'habit')
      .innerJoin('habit.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('completion.completed = :completed', { completed: true })
      .orderBy('completion.date', 'DESC')
      .getRawMany<{ habitId: string; date: string }>();

    const completedDatesByHabit = new Map<string, string[]>();
    for (const { habitId, date } of completions) {
      const dates = completedDatesByHabit.get(habitId) ?? [];
      dates.push(date);
      completedDatesByHabit.set(habitId, dates);
    }

    const streaks = new Map<string, number>();
    for (const [habitId, dates] of completedDatesByHabit) {
      streaks.set(habitId, calculateStreak(dates, getTodayDate()));
    }
    return streaks;
  }

  private async getStreakForHabit(habitId: string): Promise<number> {
    const completions = await this.completions.find({
      where: { habit: { id: habitId }, completed: true },
      order: { date: 'DESC' },
    });
    return calculateStreak(
      completions.map((completion) => completion.date),
      getTodayDate(),
    );
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
