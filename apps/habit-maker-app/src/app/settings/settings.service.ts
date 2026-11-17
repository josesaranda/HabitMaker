import { inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';

const SHOW_ARCHIVED_KEY = 'habitmaker.home.showArchived';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly authService = inject(AuthService);

  getShowArchived(): boolean {
    try {
      return this.storage.getItem(SHOW_ARCHIVED_KEY) === 'true';
    } catch {
      return false;
    }
  }

  setShowArchived(value: boolean): void {
    try {
      if (value) {
        this.storage.setItem(SHOW_ARCHIVED_KEY, 'true');
      } else {
        this.storage.removeItem(SHOW_ARCHIVED_KEY);
      }
    } catch {
      // Storage not available (e.g. private browsing restrictions).
    }
  }

  private get storage(): Storage {
    // Mirror the token storage choice: if the token is in localStorage the user
    // chose "remember me", so we persist preferences there too. Otherwise we
    // use sessionStorage so preferences last only for the current tab.
    const token = this.authService.getAuthToken();
    const inLocal =
      token !== null && localStorage.getItem('habitmaker.authToken') === token;
    return inLocal ? localStorage : sessionStorage;
  }
}
