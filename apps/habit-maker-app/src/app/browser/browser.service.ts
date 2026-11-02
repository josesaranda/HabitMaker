import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BrowserService {
  private readonly title = inject(Title);
  private readonly transloco = inject(TranslocoService);
  private titleSubscription?: Subscription;

  setTitle(translationKey: string, params?: Record<string, string>): void {
    this.titleSubscription?.unsubscribe();
    this.titleSubscription = this.transloco
      .selectTranslate(translationKey, params)
      .subscribe((pageTitle: string) =>
        this.title.setTitle(`${pageTitle} | HabitMaker`),
      );
  }
}
