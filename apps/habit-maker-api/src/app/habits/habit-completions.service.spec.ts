import { BadRequestException, NotFoundException } from '@nestjs/common';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { UserEntity } from '../auth/user.entity';
import { HabitCompletionEntity } from './habit-completion.entity';
import { HabitEntity } from './habit.entity';
import {
  calculateStreak,
  HabitCompletionsService,
} from './habit-completions.service';

function dateFromToday(offset: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

describe('HabitCompletionsService', () => {
  let dataSource: DataSource;
  let service: HabitCompletionsService;
  let user: UserEntity;
  let habit: HabitEntity;

  beforeEach(async () => {
    dataSource = new DataSource({
      type: 'sqljs',
      autoSave: false,
      entities: [UserEntity, HabitEntity, HabitCompletionEntity],
      synchronize: true,
    });
    await dataSource.initialize();

    user = await dataSource.getRepository(UserEntity).save({
      id: 'user-1',
      email: 'person@example.com',
      role: 'user',
      passwordSalt: 'salt',
      passwordHash: 'hash',
    });
    habit = await dataSource.getRepository(HabitEntity).save({
      id: 'habit-1',
      name: 'Leer',
      user,
    });
    service = new HabitCompletionsService(
      dataSource.getRepository(HabitEntity),
      dataSource.getRepository(HabitCompletionEntity),
    );
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  it('marks a habit complete for a date and returns its timestamps and streak', async () => {
    const completion = await service.setCompletion(
      habit.id,
      '2026-11-01',
      { completed: true },
      user.id,
    );

    expect(completion).toMatchObject({
      date: '2026-11-01',
      completed: true,
      currentStreak: 0,
    });
    expect(completion.completedAt).toBeInstanceOf(Date);
  });

  it('updates the existing daily record when its state changes', async () => {
    await service.setCompletion(
      habit.id,
      '2026-11-01',
      { completed: true },
      user.id,
    );
    const uncompleted = await service.setCompletion(
      habit.id,
      '2026-11-01',
      { completed: false },
      user.id,
    );

    expect(uncompleted.completed).toBe(false);
    expect(uncompleted.completedAt).toBeNull();
    expect(await dataSource.getRepository(HabitCompletionEntity).count()).toBe(
      1,
    );
  });

  it('lists completion records only after checking habit ownership', async () => {
    await service.setCompletion(
      habit.id,
      '2026-11-01',
      { completed: true },
      user.id,
    );

    await expect(service.findAll(habit.id, user.id)).resolves.toMatchObject([
      { date: '2026-11-01', completed: true },
    ]);
    await expect(service.findAll(habit.id, 'another-user')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('returns an incomplete status when no completion exists for the date', async () => {
    await expect(
      service.findForDate(habit.id, '2026-11-01', user.id),
    ).resolves.toEqual({
      date: '2026-11-01',
      completed: false,
      completedAt: null,
    });
  });

  it('returns the saved status when checking a completed date', async () => {
    await service.setCompletion(
      habit.id,
      '2026-11-01',
      { completed: true },
      user.id,
    );

    const status = await service.findForDate(habit.id, '2026-11-01', user.id);
    expect(status).toMatchObject({ date: '2026-11-01', completed: true });
    expect(status.completedAt).toBeInstanceOf(Date);
  });

  it('returns statuses only for the requested dates in their requested order', async () => {
    await service.setCompletion(
      habit.id,
      '2026-11-01',
      { completed: true },
      user.id,
    );
    await service.setCompletion(
      habit.id,
      '2026-11-02',
      { completed: true },
      user.id,
    );

    const statuses = await service.findForDates(
      habit.id,
      '2026-11-03,2026-11-01',
      user.id,
    );

    expect(
      statuses.map(({ date, completed }) => ({ date, completed })),
    ).toEqual([
      { date: '2026-11-03', completed: false },
      { date: '2026-11-01', completed: true },
    ]);
  });

  it('rejects empty, oversized, and invalid requested date lists', async () => {
    await expect(service.findForDates(habit.id, '', user.id)).rejects.toThrow(
      BadRequestException,
    );
    await expect(
      service.findForDates(
        habit.id,
        Array.from({ length: 32 }, (_, index) => `2026-11-${index + 1}`).join(
          ',',
        ),
        user.id,
      ),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.findForDates(habit.id, '2026-02-30', user.id),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects invalid dates and completion values', async () => {
    await expect(
      service.setCompletion(
        habit.id,
        '2026-02-30',
        { completed: true },
        user.id,
      ),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.setCompletion(
        habit.id,
        '2026-11-01',
        { completed: 'yes' },
        user.id,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('does not allow recording a completion for another user’s habit', async () => {
    await expect(
      service.setCompletion(
        habit.id,
        '2026-11-01',
        { completed: true },
        'another-user',
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('counts the streak of consecutive completed days ending today', async () => {
    await service.setCompletion(
      habit.id,
      dateFromToday(-1),
      { completed: true },
      user.id,
    );
    await service.setCompletion(
      habit.id,
      dateFromToday(0),
      { completed: true },
      user.id,
    );

    await expect(service.getStreak(habit.id, user.id)).resolves.toBe(2);
  });

  it('keeps the streak alive while today is still in progress', async () => {
    await service.setCompletion(
      habit.id,
      dateFromToday(-1),
      { completed: true },
      user.id,
    );

    await expect(service.getStreak(habit.id, user.id)).resolves.toBe(1);
  });

  it('resets the streak to zero when a day is missed', async () => {
    await service.setCompletion(
      habit.id,
      dateFromToday(-3),
      { completed: true },
      user.id,
    );
    // Day -2 is missed on purpose.
    await service.setCompletion(
      habit.id,
      dateFromToday(-1),
      { completed: true },
      user.id,
    );

    await expect(service.getStreak(habit.id, user.id)).resolves.toBe(1);
  });

  it('returns a zero streak when the habit was never completed', async () => {
    await expect(service.getStreak(habit.id, user.id)).resolves.toBe(0);
  });

  it('returns the streak only after checking habit ownership', async () => {
    await expect(service.getStreak(habit.id, 'another-user')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('includes the recalculated streak in the completion response', async () => {
    await service.setCompletion(
      habit.id,
      dateFromToday(-1),
      { completed: true },
      user.id,
    );
    const completion = await service.setCompletion(
      habit.id,
      dateFromToday(0),
      { completed: true },
      user.id,
    );

    expect(completion.currentStreak).toBe(2);
  });

  it('recalculates the streak when uncompleting the breaking day', async () => {
    await service.setCompletion(
      habit.id,
      dateFromToday(-1),
      { completed: true },
      user.id,
    );
    const uncompleted = await service.setCompletion(
      habit.id,
      dateFromToday(-1),
      { completed: false },
      user.id,
    );

    expect(uncompleted.currentStreak).toBe(0);
  });

  it('calculates the streak per habit for a user', async () => {
    await service.setCompletion(
      habit.id,
      dateFromToday(0),
      { completed: true },
      user.id,
    );
    const otherHabit = await dataSource.getRepository(HabitEntity).save({
      id: 'habit-2',
      name: 'Correr',
      user,
    });
    await service.setCompletion(
      otherHabit.id,
      dateFromToday(-1),
      { completed: true },
      user.id,
    );

    const streaks = await service.findStreaksByUser(user.id);

    expect(streaks.get(habit.id)).toBe(1);
    expect(streaks.get(otherHabit.id)).toBe(1);
  });
});

describe('calculateStreak', () => {
  it('counts consecutive days ending today', () => {
    expect(
      calculateStreak(['2026-11-16', '2026-11-17', '2026-11-18'], '2026-11-18'),
    ).toBe(3);
  });

  it('falls back to yesterday while today is not completed yet', () => {
    expect(calculateStreak(['2026-11-16', '2026-11-17'], '2026-11-18')).toBe(2);
  });

  it('counts a new streak started after a missed day', () => {
    expect(
      calculateStreak(['2026-11-14', '2026-11-16', '2026-11-17'], '2026-11-18'),
    ).toBe(2);
  });

  it('returns zero when yesterday was missed and today is not completed', () => {
    expect(calculateStreak(['2026-11-16'], '2026-11-18')).toBe(0);
  });

  it('starts a new streak when only today is completed', () => {
    expect(calculateStreak(['2026-11-18'], '2026-11-18')).toBe(1);
  });

  it('ignores completions dated after today', () => {
    expect(calculateStreak(['2026-11-17', '2026-11-19'], '2026-11-18')).toBe(1);
  });

  it('returns zero when nothing is completed', () => {
    expect(calculateStreak([], '2026-11-18')).toBe(0);
  });
});
