import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '@habit-maker/auth-data-access';
import { API_BASE_URL } from '@habit-maker/shared-config';
import {
  AdminEmailConfiguration,
  AdminPushConfiguration,
  AdminUser,
  UpdateEmailConfigurationInput,
  UpdatePushConfigurationInput,
} from '@habit-maker/admin-domain';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiBaseUrl = inject(API_BASE_URL, { optional: true });

  private get apiUrl(): string {
    return this.apiBaseUrl || '/api';
  }

  getUsers(): Observable<AdminUser[]> {
    if (this.authService.getUserRole() !== 'admin') {
      return throwError(() => new Error('Administrator access is required'));
    }

    return this.http.get<AdminUser[]>(`${this.apiUrl}/admin/users`);
  }

  getEmailConfiguration(): Observable<AdminEmailConfiguration> {
    if (this.authService.getUserRole() !== 'admin') {
      return throwError(() => new Error('Administrator access is required'));
    }

    return this.http.get<AdminEmailConfiguration>(
      `${this.apiUrl}/admin/email/configuration`,
    );
  }

  updateEmailConfiguration(
    configuration: UpdateEmailConfigurationInput,
  ): Observable<AdminEmailConfiguration> {
    if (this.authService.getUserRole() !== 'admin') {
      return throwError(() => new Error('Administrator access is required'));
    }

    return this.http.put<AdminEmailConfiguration>(
      `${this.apiUrl}/admin/email/configuration`,
      configuration,
    );
  }

  getPushConfiguration(): Observable<AdminPushConfiguration> {
    if (this.authService.getUserRole() !== 'admin') {
      return throwError(() => new Error('Administrator access is required'));
    }

    return this.http.get<AdminPushConfiguration>(
      `${this.apiUrl}/admin/push/configuration`,
    );
  }

  updatePushConfiguration(
    configuration: UpdatePushConfigurationInput,
  ): Observable<AdminPushConfiguration> {
    if (this.authService.getUserRole() !== 'admin') {
      return throwError(() => new Error('Administrator access is required'));
    }

    return this.http.put<AdminPushConfiguration>(
      `${this.apiUrl}/admin/push/configuration`,
      configuration,
    );
  }

  sendTestEmail(email: string): Observable<{ success: boolean }> {
    if (this.authService.getUserRole() !== 'admin') {
      return throwError(() => new Error('Administrator access is required'));
    }

    return this.http.post<{ success: boolean }>(
      `${this.apiUrl}/admin/email/test`,
      {
        email,
      },
    );
  }
}
