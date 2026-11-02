import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, Subject, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

export interface Habit {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletionStatus {
  date: string;
  completed: boolean;
  completedAt: string | null;
}

const API_URL = environment.API_URL || '/api';

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
  private readonly authService = inject(AuthService);
  private readonly habitCreatedSubject = new Subject<void>();
  readonly habitCreated$ = this.habitCreatedSubject.asObservable();

  createHabit(name: string): Observable<Habit> {
    return this.requireAuthentication(
      this.http
        .post<Habit>(`${API_URL}/habits`, { name: name.trim() })
        .pipe(tap(() => this.habitCreatedSubject.next())),
    );
  }

  getHabits(): Observable<Habit[]> {
    return this.requireAuthentication(this.http.get<Habit[]>(`${API_URL}/habits`));
  }

  getHabit(id: string): Observable<Habit> {
    return this.requireAuthentication(
      this.http.get<Habit>(`${API_URL}/habits/${encodeURIComponent(id)}`),
    );
  }

  getTodayCompletion(id: string): Observable<HabitCompletionStatus> {
    return this.requireAuthentication(
      this.http.get<HabitCompletionStatus>(
        `${API_URL}/habits/${encodeURIComponent(id)}/completions/today`,
        { params: { date: getLocalDate() } },
      ),
    );
  }

  getCompletionsForDates(
    id: string,
    dates: string[],
  ): Observable<HabitCompletionStatus[]> {
    return this.requireAuthentication(
      this.http.get<HabitCompletionStatus[]>(
        `${API_URL}/habits/${encodeURIComponent(id)}/completions`,
        { params: { dates: dates.join(',') } },
      ),
    );
  }

  markCompletedToday(id: string): Observable<HabitCompletionStatus> {
    return this.requireAuthentication(
      this.http.put<HabitCompletionStatus>(
        `${API_URL}/habits/${encodeURIComponent(id)}/completions/today`,
        { completed: true },
        { params: { date: getLocalDate() } },
      ),
    );
  }

  setCompletion(
    id: string,
    date: string,
    completed: boolean,
  ): Observable<HabitCompletionStatus> {
    return this.requireAuthentication(
      this.http.put<HabitCompletionStatus>(
        `${API_URL}/habits/${encodeURIComponent(id)}/completions/${encodeURIComponent(date)}`,
        { completed },
      ),
    );
  }

  private requireAuthentication<T>(request: Observable<T>): Observable<T> {
    return this.authService.getAuthToken()
      ? request
      : throwError(() => new Error('Authentication is required'));
  }
}
