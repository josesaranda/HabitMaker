import { BadRequestException, NotFoundException } from '@nestjs/common';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { UserEntity } from '../auth/user.entity';
import { HabitCompletionEntity } from './habit-completion.entity';
import { HabitEntity } from './habit.entity';
import { HabitCompletionsService } from './habit-completions.service';

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

  it('marks a habit complete for a date and returns its timestamps', async () => {
    const completion = await service.setCompletion(
      habit.id,
      '2026-11-01',
      { completed: true },
      user.id,
    );

    expect(completion).toMatchObject({
      date: '2026-11-01',
      completed: true,
      habit: { id: habit.id },
    });
    expect(completion.completedAt).toBeInstanceOf(Date);
    expect(completion.createdAt).toBeInstanceOf(Date);
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
});
