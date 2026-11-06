import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import {
  EntityManager,
  IsNull,
  LessThan,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { SessionEntity } from './session.entity';

export const SHORT_SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
export const REMEMBERED_SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const LAST_USED_UPDATE_INTERVAL_MS = 5 * 60 * 1000;

export interface SessionSummary {
  id: string;
  deviceName: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessions: Repository<SessionEntity>,
  ) {}

  async create(
    userId: string,
    userAgent: string | undefined,
    remembered: boolean,
  ): Promise<SessionEntity> {
    const now = Date.now();
    await this.removeOldSessions(now);
    const duration = remembered
      ? REMEMBERED_SESSION_DURATION_MS
      : SHORT_SESSION_DURATION_MS;

    return this.sessions.save(
      this.sessions.create({
        id: randomUUID(),
        userId,
        deviceName: this.getDeviceName(userAgent),
        createdAt: String(now),
        lastUsedAt: String(now),
        expiresAt: String(now + duration),
        revokedAt: null,
      }),
    );
  }

  async findActiveSession(
    sessionId: string,
    userId: string,
  ): Promise<SessionEntity | null> {
    return this.sessions.findOneBy({
      id: sessionId,
      userId,
      revokedAt: IsNull(),
      expiresAt: MoreThan(String(Date.now())),
    });
  }

  async touch(session: SessionEntity): Promise<void> {
    const now = Date.now();
    if (now - Number(session.lastUsedAt) < LAST_USED_UPDATE_INTERVAL_MS) {
      return;
    }

    await this.sessions.update(
      { id: session.id, revokedAt: IsNull() },
      { lastUsedAt: String(now) },
    );
  }

  async listForUser(
    userId: string,
    currentSessionId: string,
  ): Promise<SessionSummary[]> {
    const sessions = await this.sessions.find({
      where: {
        userId,
        revokedAt: IsNull(),
        expiresAt: MoreThan(String(Date.now())),
      },
      order: { createdAt: 'DESC' },
    });

    return sessions.map((session) => ({
      id: session.id,
      deviceName: session.deviceName,
      createdAt: new Date(Number(session.createdAt)).toISOString(),
      lastUsedAt: new Date(Number(session.lastUsedAt)).toISOString(),
      expiresAt: new Date(Number(session.expiresAt)).toISOString(),
      isCurrent: session.id === currentSessionId,
    }));
  }

  async revoke(userId: string, sessionId: string): Promise<void> {
    await this.sessions.update(
      { id: sessionId, userId, revokedAt: IsNull() },
      { revokedAt: String(Date.now()) },
    );
  }

  async revokeOthers(userId: string, currentSessionId: string): Promise<void> {
    await this.sessions.update(
      { userId, id: Not(currentSessionId), revokedAt: IsNull() },
      { revokedAt: String(Date.now()) },
    );
  }

  async revokeAllForUser(
    userId: string,
    manager: EntityManager = this.sessions.manager,
  ): Promise<void> {
    await manager
      .getRepository(SessionEntity)
      .update(
        { userId, revokedAt: IsNull() },
        { revokedAt: String(Date.now()) },
      );
  }

  private getDeviceName(userAgent?: string): string {
    if (!userAgent) return 'Unknown device';

    const browser = /Edg(?:e|A|iOS)?\//.test(userAgent)
      ? 'Edge'
      : /OPR\//.test(userAgent)
        ? 'Opera'
        : /(?:Chrome|CriOS)\//.test(userAgent)
          ? 'Chrome'
          : /(?:Firefox|FxiOS)\//.test(userAgent)
            ? 'Firefox'
            : /Safari\//.test(userAgent)
              ? 'Safari'
              : 'Browser';
    const platform = /iPhone|iPad|iPod/.test(userAgent)
      ? 'iOS'
      : /Android/.test(userAgent)
        ? 'Android'
        : /Windows/.test(userAgent)
          ? 'Windows'
          : /Mac OS X|Macintosh/.test(userAgent)
            ? 'macOS'
            : /Linux/.test(userAgent)
              ? 'Linux'
              : 'device';

    return `${browser} on ${platform}`;
  }

  private async removeOldSessions(now: number): Promise<void> {
    const retentionCutoff = String(now - REMEMBERED_SESSION_DURATION_MS);
    await this.sessions.delete({ expiresAt: LessThan(retentionCutoff) });
    await this.sessions.delete({ revokedAt: LessThan(retentionCutoff) });
  }
}
