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

const API_URL = environment.API_URL || '/api';

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
}
