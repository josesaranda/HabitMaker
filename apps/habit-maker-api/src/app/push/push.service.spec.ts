import 'reflect-metadata';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import * as webpush from 'web-push';
import { DataSource } from 'typeorm';
import { UserEntity } from '../auth/user.entity';
import { HabitEntity } from '../habits/habit.entity';
import { HabitCompletionEntity } from '../habits/habit-completion.entity';
import { PushDeliveryEntity } from './push-delivery.entity';
import { PushSubscriptionEntity } from './push-subscription.entity';
import { PushService } from './push.service';

vi.mock('web-push', () => ({
  sendNotification: vi.fn(),
  setVapidDetails: vi.fn(),
}));

describe('PushService', () => {
  let dataSource: DataSource;
  let service: PushService;
  let subscription: PushSubscriptionEntity;
  const originalPublicKey = process.env.VAPID_PUBLIC_KEY;
  const originalPrivateKey = process.env.VAPID_PRIVATE_KEY;

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.VAPID_PUBLIC_KEY = 'test-public-key';
    process.env.VAPID_PRIVATE_KEY = 'test-private-key';
    dataSource = new DataSource({
      type: 'sqljs',
      autoSave: false,
      entities: [
        UserEntity,
        HabitEntity,
        HabitCompletionEntity,
        PushSubscriptionEntity,
        PushDeliveryEntity,
      ],
      synchronize: true,
    });
    await dataSource.initialize();

    const user = await dataSource.getRepository(UserEntity).save({
      id: 'user-1',
      email: 'person@example.com',
      role: 'user',
      passwordSalt: 'salt',
      passwordHash: 'hash',
    });
    const habit = await dataSource.getRepository(HabitEntity).save({
      id: 'habit-1',
      name: 'Walk',
      user,
      reminderEnabled: true,
      reminderTime: '08:00',
      reminderTimeZone: 'America/New_York',
    });
    subscription = await dataSource.getRepository(PushSubscriptionEntity).save({
      id: 'subscription-1',
      endpoint: 'https://push.example.com/subscription/1',
      p256dh: 'p256dh-key',
      auth: 'auth-key',
      user,
    });
    expect(habit.id).toBe('habit-1');

    service = new PushService(
      dataSource.getRepository(UserEntity),
      dataSource.getRepository(HabitEntity),
      dataSource.getRepository(HabitCompletionEntity),
      dataSource.getRepository(PushSubscriptionEntity),
      dataSource.getRepository(PushDeliveryEntity),
    );
  });

  afterEach(async () => {
    await dataSource.destroy();
    vi.restoreAllMocks();
    restoreEnvironment('VAPID_PUBLIC_KEY', originalPublicKey);
    restoreEnvironment('VAPID_PRIVATE_KEY', originalPrivateKey);
  });

  it("delivers once for the user's local daily occurrence across daylight saving time", async () => {
    const sendNotification = vi.mocked(webpush.sendNotification);
    sendNotification.mockResolvedValue({} as never);

    await service.dispatchDueReminders(new Date('2026-03-08T12:00:00.000Z'));
    await service.dispatchDueReminders(new Date('2026-03-08T12:00:30.000Z'));

    expect(sendNotification).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(sendNotification.mock.calls[0][1] as string);
    expect(payload.notification.data.onActionClick.default.url).toBe(
      'http://localhost:4200/habits/habit-1',
    );

    await service.dispatchDueReminders(new Date('2026-03-09T12:00:00.000Z'));
    expect(sendNotification).toHaveBeenCalledTimes(2);
  });

  it('localizes each device notification using its saved app language', async () => {
    const user = await dataSource
      .getRepository(UserEntity)
      .findOneByOrFail({ id: 'user-1' });
    await dataSource.getRepository(PushSubscriptionEntity).save({
      id: 'subscription-es',
      endpoint: 'https://push.example.com/subscription/es',
      p256dh: 'p256dh-key-es',
      auth: 'auth-key-es',
      language: 'es',
      user,
    });
    vi.mocked(webpush.sendNotification).mockResolvedValue({} as never);

    await service.dispatchDueReminders(new Date('2026-03-08T12:00:00.000Z'));

    const bodies = vi
      .mocked(webpush.sendNotification)
      .mock.calls.map(([, message]) =>
        JSON.parse(message as string).notification.body,
      );
    expect(bodies).toContain('Time for: Walk');
    expect(bodies).toContain('Es hora de: Walk');
  });

  it('skips an occurrence after the habit has been completed that day', async () => {
    const habit = await dataSource
      .getRepository(HabitEntity)
      .findOneByOrFail({ id: 'habit-1' });
    await dataSource.getRepository(HabitCompletionEntity).save({
      id: 'completion-1',
      habit,
      date: '2026-03-08',
      completed: true,
      completedAt: new Date('2026-03-08T11:00:00.000Z'),
    });
    const sendNotification = vi.mocked(webpush.sendNotification);
    sendNotification.mockResolvedValue({} as never);

    await service.dispatchDueReminders(new Date('2026-03-08T12:00:00.000Z'));

    expect(sendNotification).not.toHaveBeenCalled();
    expect(
      await dataSource.getRepository(PushSubscriptionEntity).findOneBy({
        id: subscription.id,
      }),
    ).not.toBeNull();
  });

  it('removes subscriptions rejected as expired by the push service', async () => {
    vi.mocked(webpush.sendNotification).mockRejectedValue({ statusCode: 410 });

    await service.dispatchDueReminders(new Date('2026-03-08T12:00:00.000Z'));

    await expect(
      dataSource.getRepository(PushSubscriptionEntity).findOneBy({
        id: subscription.id,
      }),
    ).resolves.toBeNull();
  });

  it('keeps browser subscriptions associated with their authenticated owner', async () => {
    const otherUser = await dataSource.getRepository(UserEntity).save({
      id: 'user-2',
      email: 'other@example.com',
      role: 'user',
      passwordSalt: 'salt',
      passwordHash: 'hash',
    });
    const payload = {
      endpoint: subscription.endpoint,
      keys: { p256dh: 'updated-key', auth: 'updated-auth' },
      language: 'es',
    };

    await expect(
      service.saveSubscription(payload, 'user-1'),
    ).resolves.toBeUndefined();
    await expect(
      dataSource.getRepository(PushSubscriptionEntity).findOneByOrFail({
        id: subscription.id,
      }),
    ).resolves.toMatchObject({ language: 'es' });
    await expect(
      service.saveSubscription(payload, otherUser.id),
    ).rejects.toThrow(ForbiddenException);
    await service.saveSubscription(
      {
        endpoint: 'https://push.example.com/subscription/2',
        keys: { p256dh: 'second-key', auth: 'second-auth' },
        language: 'en',
      },
      otherUser.id,
    );
    await expect(
      service.saveSubscription(
        {
          endpoint: 'https://push.example.com/invalid-language',
          keys: { p256dh: 'key', auth: 'auth' },
          language: 'fr',
        },
        'user-1',
      ),
    ).rejects.toThrow(BadRequestException);

    expect(await dataSource.getRepository(PushSubscriptionEntity).count()).toBe(
      2,
    );
    await service.removeSubscription(payload, otherUser.id);
    expect(await dataSource.getRepository(PushSubscriptionEntity).count()).toBe(
      2,
    );
    await service.removeSubscription(payload, 'user-1');
    expect(await dataSource.getRepository(PushSubscriptionEntity).count()).toBe(
      1,
    );
  });
});

function restoreEnvironment(name: string, value: string | undefined): void {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
