import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { TranslocoService } from '@jsverse/transloco';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TitleService {
  private readonly title = inject(Title);
  private readonly transloco = inject(TranslocoService);
  private titleSubscription?: Subscription;

  setTitle(translationKey: string, params?: Record<string, string>): void {
    this.titleSubscription?.unsubscribe();
    this.titleSubscription = this.transloco
      .selectTranslate(translationKey, params)
      .subscribe((pageTitle: string) => {
        const fullTitle = `${pageTitle} | HabitMaker`;
        this.title.setTitle(fullTitle);
        this.updateDesktopWindowTitle(fullTitle);
      });
  }

  private updateDesktopWindowTitle(title: string): void {
    try {
      const currentWindow = getCurrentWindow();
      if (typeof currentWindow?.setTitle === 'function') {
        void Promise.resolve(currentWindow.setTitle(title)).catch(() => {});
      }
    } catch {
      // Ignore failures when not running inside the Tauri desktop runtime.
    }
  }
}
