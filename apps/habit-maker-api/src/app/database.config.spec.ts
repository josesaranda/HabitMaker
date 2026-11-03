import { getDatabaseConfig } from './database.config';

describe('getDatabaseConfig', () => {
  it('uses an in-memory sql.js database when PostgreSQL is not configured', () => {
    expect(getDatabaseConfig({})).toMatchObject({
      type: 'sqljs',
      autoSave: false,
      synchronize: true,
    });
  });

  it('uses PostgreSQL when its environment variables are configured', () => {
    expect(
      getDatabaseConfig({
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5433',
        POSTGRES_USER: 'habitmaker',
        POSTGRES_PASSWORD: 'secret',
        POSTGRES_DB: 'habitmaker',
      }),
    ).toMatchObject({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'habitmaker',
      password: 'secret',
      database: 'habitmaker',
      synchronize: true,
    });
  });

  it('rejects incomplete PostgreSQL configuration', () => {
    expect(() => getDatabaseConfig({ POSTGRES_HOST: 'localhost' })).toThrow(
      'PostgreSQL configuration is incomplete.',
    );
  });
});
