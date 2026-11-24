import { Injectable, inject } from '@angular/core';
import { isDesktopApp } from '@habit-maker/shared-data-access';
import { LanguageService } from '@habit-maker/i18n-data-access';
import { AuthService } from '@habit-maker/auth-data-access';
import { HabitService } from './habit.service';

interface ShownState {
  date: string;
  ids: string[];
}

@Injectable({ providedIn: 'root' })
export class DesktopReminderService {
  private readonly habitService = inject(HabitService);
  private readonly languageService = inject(LanguageService);
  private readonly authService = inject(AuthService);
  private interval: ReturnType<typeof setInterval> | undefined;

  start(): void {
    if (!isDesktopApp() || typeof Notification === 'undefined') return;
    if (this.interval) return;
    void this.check();
    this.interval = setInterval(() => void this.check(), 15_000);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  private todayKey(): string {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  private loadShown(): ShownState {
    try {
      const raw = window.localStorage.getItem(
        'habitmaker.desktop.shownReminders',
      );
      if (raw) {
        const parsed = JSON.parse(raw) as ShownState;
        if (
          parsed &&
          typeof parsed.date === 'string' &&
          Array.isArray(parsed.ids)
        ) {
          return parsed;
        }
      }
    } catch {
      // Ignore storage errors and start fresh.
    }
    return { date: this.todayKey(), ids: [] };
  }

  private saveShown(state: ShownState): void {
    try {
      window.localStorage.setItem(
        'habitmaker.desktop.shownReminders',
        JSON.stringify(state),
      );
    } catch {
      // Ignore storage errors.
    }
  }

  private async check(): Promise<void> {
    if (!this.authService.isAuthenticated()) return;
    if (Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch {
        // Permission request failed; skip this cycle.
        return;
      }
    }
    if (Notification.permission !== 'granted') return;

    let state = this.loadShown();
    const today = this.todayKey();
    if (state.date !== today) {
      state = { date: today, ids: [] };
      this.saveShown(state);
    }
    const shown = new Set(state.ids);

    this.habitService.getDueDesktopReminders().subscribe({
      next: (reminders) => {
        for (const reminder of reminders) {
          if (shown.has(reminder.habitId)) continue;
          const language = this.languageService.language();
          const body =
            language === 'es'
              ? `Es hora de: ${reminder.habitName}`
              : `Time for: ${reminder.habitName}`;
          try {
            new Notification('HabitMaker', {
              body,
              icon: '/icons/icon-192.png',
            });
          } catch {
            // Ignore notification errors.
          }
          shown.add(reminder.habitId);
          state.ids.push(reminder.habitId);
          this.saveShown(state);
        }
      },
      error: () => {
        // Silently ignore polling errors (e.g. unauthenticated).
      },
    });
  }
}
