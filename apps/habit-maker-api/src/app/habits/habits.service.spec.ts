import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { UserEntity } from '../auth/user.entity';
import { HabitEntity } from './habit.entity';
import { HabitsService } from './habits.service';

describe('HabitsService', () => {
  let dataSource: DataSource;
  let service: HabitsService;
  let user: UserEntity;

  beforeEach(async () => {
    dataSource = new DataSource({
      type: 'sqljs',
      autoSave: false,
      entities: [UserEntity, HabitEntity],
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
});
