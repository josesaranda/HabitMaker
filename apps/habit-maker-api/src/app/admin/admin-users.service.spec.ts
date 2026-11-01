import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { UserEntity } from '../auth/user.entity';
import { HabitEntity } from '../habits/habit.entity';
import { HabitCompletionEntity } from '../habits/habit-completion.entity';
import { AdminUsersService } from './admin-users.service';

describe('AdminUsersService', () => {
  let dataSource: DataSource;
  let service: AdminUsersService;

  beforeEach(async () => {
    dataSource = new DataSource({
      type: 'sqljs',
      autoSave: false,
      entities: [UserEntity, HabitEntity, HabitCompletionEntity],
      synchronize: true,
    });
    await dataSource.initialize();
    service = new AdminUsersService(dataSource.getRepository(UserEntity));
    await dataSource.getRepository(UserEntity).save([
      {
        id: 'user-2',
        email: 'zeta@example.com',
        role: 'user',
        passwordSalt: 'salt',
        passwordHash: 'secret-hash',
      },
      {
        id: 'admin-1',
        email: 'admin@example.com',
        role: 'admin',
        passwordSalt: 'salt',
        passwordHash: 'secret-hash',
      },
    ]);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  it('returns all users without credential data, ordered by email', async () => {
    const users = await service.findAll();

    expect(users).toEqual([
      { id: 'admin-1', email: 'admin@example.com', role: 'admin' },
      { id: 'user-2', email: 'zeta@example.com', role: 'user' },
    ]);
    expect(users[0]).not.toHaveProperty('passwordSalt');
    expect(users[0]).not.toHaveProperty('passwordHash');
  });
});
