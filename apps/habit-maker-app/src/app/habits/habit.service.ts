import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    const token = this.authService.getAuthToken();
    if (!token) {
      return throwError(() => new Error('Authentication is required'));
    }

    return this.http
      .post<Habit>(
        `${API_URL}/habits`,
        { name: name.trim() },
        {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
        },
      )
      .pipe(tap(() => this.habitCreatedSubject.next()));
  }

  getHabits(): Observable<Habit[]> {
    const token = this.authService.getAuthToken();
    if (!token) {
      return throwError(() => new Error('Authentication is required'));
    }

    return this.http.get<Habit[]>(`${API_URL}/habits`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    });
  }

  getHabit(id: string): Observable<Habit> {
    const token = this.authService.getAuthToken();
    if (!token) {
      return throwError(() => new Error('Authentication is required'));
    }

    return this.http.get<Habit>(`${API_URL}/habits/${encodeURIComponent(id)}`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    });
  }

  getTodayCompletion(id: string): Observable<HabitCompletionStatus> {
    const token = this.authService.getAuthToken();
    if (!token) {
      return throwError(() => new Error('Authentication is required'));
    }

    return this.http.get<HabitCompletionStatus>(
      `${API_URL}/habits/${encodeURIComponent(id)}/completions/today`,
      {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
        params: { date: getLocalDate() },
      },
    );
  }

  markCompletedToday(id: string): Observable<HabitCompletionStatus> {
    const token = this.authService.getAuthToken();
    if (!token) {
      return throwError(() => new Error('Authentication is required'));
    }

    return this.http.put<HabitCompletionStatus>(
      `${API_URL}/habits/${encodeURIComponent(id)}/completions/today`,
      { completed: true },
      {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
        params: { date: getLocalDate() },
      },
    );
  }
}
