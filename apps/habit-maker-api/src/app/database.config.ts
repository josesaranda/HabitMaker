import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { HabitEntity } from './habits/habit.entity';
import { HabitCompletionEntity } from './habits/habit-completion.entity';
import { UserEntity } from './auth/user.entity';
import { PushSubscriptionEntity } from './push/push-subscription.entity';
import { PushDeliveryEntity } from './push/push-delivery.entity';

const entities = [
  UserEntity,
  HabitEntity,
  HabitCompletionEntity,
  PushSubscriptionEntity,
  PushDeliveryEntity,
];
const postgresVariables = [
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
] as const;

type DatabaseEnvironment = Record<string, string | undefined>;

export function getDatabaseConfig(
  environment: DatabaseEnvironment = process.env,
): TypeOrmModuleOptions {
  const hasPostgresConfiguration = postgresVariables.some(
    (variable) => environment[variable]?.trim(),
  );

  if (!hasPostgresConfiguration) {
    return {
      type: 'sqljs',
      // sql.js creates a fresh in-memory database when no location is set.
      autoSave: false,
      entities,
      synchronize: true,
    };
  }

  const requiredVariables = [
    'POSTGRES_HOST',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',
  ] as const;
  const missingVariables = requiredVariables.filter(
    (variable) => !environment[variable]?.trim(),
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `PostgreSQL configuration is incomplete. Set: ${missingVariables.join(', ')}.`,
    );
  }

  const port = Number(environment.POSTGRES_PORT || 5432);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('POSTGRES_PORT must be an integer between 1 and 65535.');
  }

  return {
    type: 'postgres',
    host: environment.POSTGRES_HOST,
    port,
    username: environment.POSTGRES_USER,
    password: environment.POSTGRES_PASSWORD,
    database: environment.POSTGRES_DB,
    entities,
    synchronize: true,
  };
}
