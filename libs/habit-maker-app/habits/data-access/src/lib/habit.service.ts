import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Observable,
  Subject,
  catchError,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import {
  Habit,
  HabitCompletionStatus,
  HabitReminder,
} from '@habit-maker/habits-domain';
import { API_BASE_URL, AUTH_TOKEN_PROVIDER } from '@habit-maker/shared-config';

export type SupportedLanguage = 'en' | 'es';

function getLocalDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

@Injectable({ providedIn: 'root' })
export class HabitService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL, { optional: true });
  private readonly authTokenProvider = inject(AUTH_TOKEN_PROVIDER, {
    optional: true,
  });
  private readonly habitCreatedSubject = new Subject<void>();
  readonly habitCreated$ = this.habitCreatedSubject.asObservable();

  private get apiUrl(): string {
    return this.apiBaseUrl || '/api';
  }

  createHabit(name: string, emoji: string | null): Observable<Habit> {
    return this.requireAuthentication(
      this.http
        .post<Habit>(`${this.apiUrl}/habits`, { name: name.trim(), emoji })
        .pipe(tap(() => this.habitCreatedSubject.next())),
    );
  }

  getHabits({ includeArchived = false } = {}): Observable<Habit[]> {
    return this.requireAuthentication(
      this.http.get<Habit[]>(`${this.apiUrl}/habits`, {
        params: includeArchived ? { includeArchived: 'true' } : {},
      }),
    );
  }

  getHabit(id: string): Observable<Habit> {
    return this.requireAuthentication(
      this.http.get<Habit>(`${this.apiUrl}/habits/${encodeURIComponent(id)}`),
    );
  }

  updateHabit(
    id: string,
    name: string,
    emoji: string | null,
  ): Observable<Habit> {
    return this.requireAuthentication(
      this.http.put<Habit>(`${this.apiUrl}/habits/${encodeURIComponent(id)}`, {
        name: name.trim(),
        emoji,
      }),
    );
  }

  getReminder(id: string): Observable<HabitReminder> {
    return this.requireAuthentication(
      this.http.get<HabitReminder>(
        `${this.apiUrl}/habits/${encodeURIComponent(id)}/reminder`,
      ),
    );
  }

  saveReminder(id: string, reminder: HabitReminder): Observable<HabitReminder> {
    return this.requireAuthentication(
      this.http.put<HabitReminder>(
        `${this.apiUrl}/habits/${encodeURIComponent(id)}/reminder`,
        reminder,
      ),
    );
  }

  getPushPublicKey(): Observable<{ publicKey: string | null }> {
    return this.requireAuthentication(
      this.http.get<{ publicKey: string | null }>(
        `${this.apiUrl}/push/public-key`,
      ),
    );
  }

  getDueDesktopReminders(): Observable<
    Array<{ habitId: string; habitName: string }>
  > {
    return this.requireAuthentication(
      this.http.get<Array<{ habitId: string; habitName: string }>>(
        `${this.apiUrl}/push/desktop-reminders`,
      ),
    );
  }

  savePushSubscription(
    subscription: PushSubscriptionJSON,
    language: SupportedLanguage,
  ): Observable<void> {
    return this.requireAuthentication(
      this.http.put<void>(`${this.apiUrl}/push/subscriptions`, {
        ...subscription,
        language,
      }),
    );
  }

  getTodayCompletion(id: string): Observable<HabitCompletionStatus> {
    return this.requireAuthentication(
      this.http.get<HabitCompletionStatus>(
        `${this.apiUrl}/habits/${encodeURIComponent(id)}/completions/today`,
        { params: { date: getLocalDate() } },
      ),
    );
  }

  getTodayCompletions(ids: string[]): Observable<Record<string, boolean>> {
    if (ids.length === 0) return this.requireAuthentication(of({}));
    const requests = ids.map((id) =>
      this.getTodayCompletion(id).pipe(
        map((completion) => [id, completion.completed] as const),
        catchError(() => of([id, false] as const)),
      ),
    );
    return this.requireAuthentication(
      forkJoin(requests).pipe(map((entries) => Object.fromEntries(entries))),
    );
  }

  /** @deprecated Use getCompletionsForRange instead. */
  getCompletionsForDates(
    id: string,
    dates: string[],
  ): Observable<HabitCompletionStatus[]> {
    return this.requireAuthentication(
      this.http.get<HabitCompletionStatus[]>(
        `${this.apiUrl}/habits/${encodeURIComponent(id)}/completions`,
        { params: { dates: dates.join(',') } },
      ),
    );
  }

  getCompletionsForRange(
    id: string,
    from: string,
    to: string,
  ): Observable<HabitCompletionStatus[]> {
    return this.requireAuthentication(
      this.http.get<HabitCompletionStatus[]>(
        `${this.apiUrl}/habits/${encodeURIComponent(id)}/completions`,
        { params: { from, to } },
      ),
    );
  }

  setCompletion(
    id: string,
    date: string,
    completed: boolean,
  ): Observable<HabitCompletionStatus & { currentStreak: number }> {
    return this.requireAuthentication<
      HabitCompletionStatus & { currentStreak: number }
    >(
      this.http.put<HabitCompletionStatus & { currentStreak: number }>(
        `${this.apiUrl}/habits/${encodeURIComponent(id)}/completions/${encodeURIComponent(date)}`,
        { completed },
      ),
    );
  }

  getHabitsWithTodayCompletions({ includeArchived = false } = {}): Observable<{
    habits: Habit[];
    completions: Record<string, boolean>;
  }> {
    return this.getHabits({ includeArchived }).pipe(
      switchMap((habits) => {
        if (habits.length === 0) {
          return of({ habits, completions: {} });
        }
        return this.getTodayCompletions(habits.map((habit) => habit.id)).pipe(
          map((completions) => ({ habits, completions })),
        );
      }),
    );
  }

  getArchivedCount(): Observable<{ count: number }> {
    return this.requireAuthentication(
      this.http.get<{ count: number }>(`${this.apiUrl}/habits/archived/count`),
    );
  }

  archiveHabit(id: string, archived: boolean): Observable<Habit> {
    return this.requireAuthentication(
      this.http.put<Habit>(
        `${this.apiUrl}/habits/${encodeURIComponent(id)}/archive`,
        { archived },
      ),
    );
  }

  deleteHabit(id: string): Observable<void> {
    return this.requireAuthentication(
      this.http.delete<void>(`${this.apiUrl}/habits/${encodeURIComponent(id)}`),
    );
  }

  private requireAuthentication<T>(request: Observable<T>): Observable<T> {
    return (this.authTokenProvider?.getAuthToken() ?? null)
      ? request
      : throwError(() => new Error('Authentication is required'));
  }
}
