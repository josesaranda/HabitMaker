import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CurrentVersion {
  version: string;
}

export interface VersionCheckResult {
  currentVersion: string;
  latestVersion: string | null;
  updateAvailable: boolean;
  releaseUrl: string | null;
  publishedAt: string | null;
}

const API_URL = environment.API_URL || '/api';

@Injectable({ providedIn: 'root' })
export class AppVersionService {
  private readonly http = inject(HttpClient);

  getCurrentVersion(): Observable<CurrentVersion> {
    return this.http.get<CurrentVersion>(`${API_URL}/version`);
  }

  checkForUpdates(): Observable<VersionCheckResult> {
    return this.http.get<VersionCheckResult>(`${API_URL}/version/check`);
  }
}
