import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import * as webpush from 'web-push';
import { Repository } from 'typeorm';
import { UserEntity } from '../auth/user.entity';
import { HabitEntity } from '../habits/habit.entity';
import { HabitCompletionEntity } from '../habits/habit-completion.entity';
import { PushDeliveryEntity } from './push-delivery.entity';
import {
  PushLanguage,
  PushSubscriptionEntity,
} from './push-subscription.entity';

interface WebPushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  language: PushLanguage;
}

interface LocalDateTime {
  date: string;
  time: string;
}

@Injectable()
export class PushService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PushService.name);
  private readonly publicKey = process.env.VAPID_PUBLIC_KEY ?? '';
  private readonly privateKey = process.env.VAPID_PRIVATE_KEY ?? '';
  private interval: NodeJS.Timeout | undefined;
  private dispatching = false;

  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(HabitEntity)
    private readonly habits: Repository<HabitEntity>,
    @InjectRepository(HabitCompletionEntity)
    private readonly completions: Repository<HabitCompletionEntity>,
    @InjectRepository(PushSubscriptionEntity)
    private readonly subscriptions: Repository<PushSubscriptionEntity>,
    @InjectRepository(PushDeliveryEntity)
    private readonly deliveries: Repository<PushDeliveryEntity>,
  ) {}

  onModuleInit(): void {
    if (!this.isConfigured()) return;
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT ?? 'mailto:admin@habitmaker.local',
      this.publicKey,
      this.privateKey,
    );
    this.interval = setInterval(() => void this.dispatchDueReminders(), 15_000);
    this.interval.unref();
    void this.dispatchDueReminders();
  }

  onModuleDestroy(): void {
    if (this.interval) clearInterval(this.interval);
  }

  getPublicKey(): string | null {
    return this.isConfigured() ? this.publicKey : null;
  }

  async saveSubscription(input: unknown, userId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        'Push notifications are not configured',
      );
    }
    const subscription = this.parseSubscription(input);
    const user = await this.users.findOneBy({ id: userId });
    if (!user)
      throw new BadRequestException('The authenticated user no longer exists');

    const existing = await this.subscriptions.findOne({
      where: { endpoint: subscription.endpoint },
      relations: { user: true },
    });
    if (existing && existing.user.id !== userId) {
      throw new ForbiddenException(
        'This push subscription belongs to another user',
      );
    }
    await this.subscriptions.save(
      this.subscriptions.create({
        ...(existing ? { id: existing.id } : { id: randomUUID() }),
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        language: subscription.language,
        user,
      }),
    );
  }

  async removeSubscription(input: unknown, userId: string): Promise<void> {
    if (!input || typeof input !== 'object') {
      throw new BadRequestException('A subscription endpoint is required');
    }
    const endpoint = (input as Record<string, unknown>)['endpoint'];
    if (typeof endpoint !== 'string' || !this.isHttpsUrl(endpoint)) {
      throw new BadRequestException(
        'A valid subscription endpoint is required',
      );
    }
    await this.subscriptions.delete({ endpoint, user: { id: userId } });
  }

  async dispatchDueReminders(now = new Date()): Promise<void> {
    if (!this.isConfigured() || this.dispatching) return;
    this.dispatching = true;
    try {
      const habits = await this.habits.find({
        where: { reminderEnabled: true },
        relations: { user: true },
      });
      const subscriptionsByUser = new Map<string, PushSubscriptionEntity[]>();
      for (const habit of habits) {
        const time = habit.reminderTime;
        const timeZone = habit.reminderTimeZone;
        if (!time || !timeZone) continue;

        const occurrence = this.getDueOccurrence(now, timeZone, time);
        if (!occurrence) continue;
        const completed = await this.completions.findOneBy({
          habit: { id: habit.id },
          date: occurrence.date,
          completed: true,
        });
        if (completed) continue;

        let subscriptions = subscriptionsByUser.get(habit.user.id);
        if (!subscriptions) {
          subscriptions = await this.subscriptions.find({
            where: { user: { id: habit.user.id } },
          });
          subscriptionsByUser.set(habit.user.id, subscriptions);
        }

        for (const subscription of subscriptions) {
          const claimed = await this.claimDelivery(
            habit,
            subscription,
            occurrence.date,
          );
          if (!claimed) continue;
          await this.deliver(habit, subscription);
        }
      }
    } catch (error) {
      this.logger.error('Unable to process scheduled push reminders', error);
    } finally {
      this.dispatching = false;
    }
  }

  private async claimDelivery(
    habit: HabitEntity,
    subscription: PushSubscriptionEntity,
    localDate: string,
  ): Promise<boolean> {
    try {
      await this.deliveries.insert({
        id: randomUUID(),
        habit,
        subscription,
        localDate,
      });
      return true;
    } catch {
      // The unique occurrence constraint arbitrates concurrent API instances.
      // A failed claim must never send, even if the database error was transient.
      return false;
    }
  }

  private async deliver(
    habit: HabitEntity,
    subscription: PushSubscriptionEntity,
  ): Promise<void> {
    const appUrl = (process.env.APP_URL ?? 'http://localhost:4200').replace(
      /\/$/,
      '',
    );
    const habitUrl = `${appUrl}/habits/${encodeURIComponent(habit.id)}`;
    const payload = JSON.stringify({
      notification: {
        title: 'HabitMaker',
        body:
          subscription.language === 'es'
            ? `Es hora de: ${habit.name}`
            : `Time for: ${habit.name}`,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        data: {
          onActionClick: {
            default: { operation: 'navigateLastFocusedOrOpen', url: habitUrl },
          },
        },
      },
    });

    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        payload,
      );
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await this.subscriptions.delete({ id: subscription.id });
        return;
      }
      this.logger.warn(`Push delivery failed for habit ${habit.id}`);
    }
  }

  private getDueOccurrence(
    now: Date,
    timeZone: string,
    reminderTime: string,
  ): LocalDateTime | null {
    // Looking at the previous minute as well makes scheduling resilient to
    // process startup and timer drift; the unique delivery record deduplicates it.
    for (const instant of [now, new Date(now.getTime() - 60_000)]) {
      const local = this.getLocalDateTime(instant, timeZone);
      if (local.time === reminderTime) return local;
    }
    return null;
  }

  private getLocalDateTime(instant: Date, timeZone: string): LocalDateTime {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(instant);
    const value = Object.fromEntries(
      parts.map(({ type, value }) => [type, value]),
    );
    return {
      date: `${value['year']}-${value['month']}-${value['day']}`,
      time: `${value['hour']}:${value['minute']}`,
    };
  }

  private parseSubscription(input: unknown): WebPushSubscriptionInput {
    if (!input || typeof input !== 'object') {
      throw new BadRequestException('A push subscription is required');
    }
    const value = input as Record<string, unknown>;
    const keys = value['keys'];
    const language = value['language'] ?? 'en';
    if (
      typeof value['endpoint'] !== 'string' ||
      !this.isHttpsUrl(value['endpoint']) ||
      (language !== 'en' && language !== 'es') ||
      !keys ||
      typeof keys !== 'object' ||
      typeof (keys as Record<string, unknown>)['p256dh'] !== 'string' ||
      !(keys as Record<string, string>)['p256dh'] ||
      typeof (keys as Record<string, unknown>)['auth'] !== 'string' ||
      !(keys as Record<string, string>)['auth']
    ) {
      throw new BadRequestException('A valid push subscription is required');
    }
    return {
      endpoint: value['endpoint'],
      language,
      keys: {
        p256dh: (keys as Record<string, string>)['p256dh'],
        auth: (keys as Record<string, string>)['auth'],
      },
    };
  }

  private isHttpsUrl(value: string): boolean {
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  }

  private isConfigured(): boolean {
    return Boolean(this.publicKey && this.privateKey);
  }
}
