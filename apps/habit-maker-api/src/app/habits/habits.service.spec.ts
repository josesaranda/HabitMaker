import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { UserEntity } from '../auth/user.entity';
import { HabitEntity } from './habit.entity';
import { HabitCompletionEntity } from './habit-completion.entity';
import { HabitsService } from './habits.service';

describe('HabitsService', () => {
  let dataSource: DataSource;
  let service: HabitsService;
  let user: UserEntity;

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
    service = new HabitsService(
      dataSource.getRepository(HabitEntity),
      dataSource.getRepository(UserEntity),
    );
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  it('creates a habit for the authenticated user with automatic timestamps', async () => {
    const created = await service.create(
      { name: '  Leer 10 minutos  ' },
      user.id,
    );
    const stored = await dataSource.getRepository(HabitEntity).findOneOrFail({
      where: { id: created.id },
      relations: { user: true },
    });

    expect(created).toMatchObject({ name: 'Leer 10 minutos' });
    expect(created.createdAt).toBeInstanceOf(Date);
    expect(created.updatedAt).toBeInstanceOf(Date);
    expect(stored.user.id).toBe(user.id);
  });

  it('returns only habits belonging to the requested user', async () => {
    await service.create({ name: 'Leer' }, user.id);
    const otherUser = await dataSource.getRepository(UserEntity).save({
      id: 'user-2',
      email: 'other@example.com',
      role: 'user',
      passwordSalt: 'salt',
      passwordHash: 'hash',
    });
    await service.create({ name: 'Correr' }, otherUser.id);

    await expect(service.findAll(user.id)).resolves.toMatchObject([
      { name: 'Leer' },
    ]);
  });

  it('returns a habit by id only for its owner', async () => {
    const created = await service.create({ name: 'Leer' }, user.id);

    await expect(service.findOne(created.id, user.id)).resolves.toMatchObject({
      id: created.id,
      name: 'Leer',
    });
    await expect(service.findOne(created.id, 'another-user')).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.findOne('missing-habit', user.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('renames an owned habit and keeps its identity', async () => {
    const created = await service.create({ name: 'Leer' }, user.id);

    await expect(
      service.update(created.id, { name: '  Leer 10 minutos  ' }, user.id),
    ).resolves.toMatchObject({
      id: created.id,
      name: 'Leer 10 minutos',
    });

    await expect(service.findOne(created.id, user.id)).resolves.toMatchObject({
      id: created.id,
      name: 'Leer 10 minutos',
    });
  });

  it('does not rename a habit owned by another user', async () => {
    const created = await service.create({ name: 'Leer' }, user.id);

    await expect(
      service.update(created.id, { name: 'Correr' }, 'another-user'),
    ).rejects.toThrow(NotFoundException);
    await expect(
      service.update('missing-habit', { name: 'Correr' }, user.id),
    ).rejects.toThrow(NotFoundException);
    await expect(service.findOne(created.id, user.id)).resolves.toMatchObject({
      name: 'Leer',
    });
  });

  it('rejects blank and overly long names when renaming a habit', async () => {
    const created = await service.create({ name: 'Leer' }, user.id);

    await expect(
      service.update(created.id, { name: '   ' }, user.id),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.update(created.id, { name: 'h'.repeat(101) }, user.id),
    ).rejects.toThrow(BadRequestException);
    await expect(service.update(created.id, null, user.id)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('deletes an owned habit and cascades its completion history', async () => {
    const created = await service.create({ name: 'Leer' }, user.id);
    const habit = await dataSource
      .getRepository(HabitEntity)
      .findOneByOrFail({ id: created.id });
    await dataSource.getRepository(HabitCompletionEntity).save({
      id: 'completion-1',
      habit,
      date: '2026-11-01',
      completed: true,
      completedAt: new Date('2026-11-01T12:00:00.000Z'),
    });

    await service.remove(created.id, user.id);

    await expect(
      dataSource.getRepository(HabitEntity).findOneBy({ id: created.id }),
    ).resolves.toBeNull();
    await expect(
      dataSource
        .getRepository(HabitCompletionEntity)
        .findOneBy({ id: 'completion-1' }),
    ).resolves.toBeNull();
  });

  it('does not delete another user habit or a missing habit', async () => {
    const created = await service.create({ name: 'Leer' }, user.id);

    await expect(service.remove(created.id, 'another-user')).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.remove('missing-habit', user.id)).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.findOne(created.id, user.id)).resolves.toMatchObject({
      id: created.id,
    });
  });

  it('rejects missing, blank, and overly long habit names', async () => {
    await expect(service.create(null, user.id)).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.create({ name: '   ' }, user.id)).rejects.toThrow(
      BadRequestException,
    );
    await expect(
      service.create({ name: 'h'.repeat(101) }, user.id),
    ).rejects.toThrow(BadRequestException);
  });

  it('does not create a habit for a user that no longer exists', async () => {
    await expect(
      service.create({ name: 'Leer' }, 'missing-user'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('stores daily reminder settings only for the habit owner', async () => {
    const created = await service.create({ name: 'Leer' }, user.id);

    await expect(
      service.updateReminder(
        created.id,
        { enabled: true, time: '08:15', timeZone: 'Europe/Madrid' },
        user.id,
      ),
    ).resolves.toEqual({
      enabled: true,
      time: '08:15',
      timeZone: 'Europe/Madrid',
    });
    await expect(
      service.getReminder(created.id, 'another-user'),
    ).rejects.toThrow(NotFoundException);
    await expect(
      service.updateReminder(
        created.id,
        { enabled: true, time: '25:99', timeZone: 'Europe/Madrid' },
        user.id,
      ),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.updateReminder(
        created.id,
        { enabled: true, time: '08:15', timeZone: 'Not/AZone' },
        user.id,
      ),
    ).rejects.toThrow(BadRequestException);

    await expect(service.getReminder(created.id, user.id)).resolves.toEqual({
      enabled: true,
      time: '08:15',
      timeZone: 'Europe/Madrid',
    });
  });
});
