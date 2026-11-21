import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@habit-maker/shared-config';
import {
  CurrentVersion,
  VersionCheckResult,
} from '@habit-maker/settings-domain';

@Injectable({ providedIn: 'root' })
export class AppVersionService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL, { optional: true });

  private get apiUrl(): string {
    return this.apiBaseUrl || '/api';
  }

  getCurrentVersion(): Observable<CurrentVersion> {
    return this.http.get<CurrentVersion>(`${this.apiUrl}/version`);
  }

  checkForUpdates(): Observable<VersionCheckResult> {
    return this.http.get<VersionCheckResult>(`${this.apiUrl}/version/check`);
  }
}
