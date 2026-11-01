import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class BrowserService {
  private readonly title = inject(Title);

  setTitle(pageTitle: string): void {
    const title = pageTitle.replace(/\s*\|\s*HabitMaker\s*$/, '').trim();
    this.title.setTitle(`${title} | HabitMaker`);
  }
}
