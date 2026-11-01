import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

const API_URL = environment.API_URL || '/api';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  getUsers(): Observable<AdminUser[]> {
    if (this.authService.getUserRole() !== 'admin') {
      return throwError(() => new Error('Administrator access is required'));
    }

    return this.http.get<AdminUser[]>(`${API_URL}/admin/users`);
  }
}
