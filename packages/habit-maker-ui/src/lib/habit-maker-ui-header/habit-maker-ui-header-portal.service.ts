import { Injectable, TemplateRef, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HabitMakerUIHeaderPortalService {
  readonly template = signal<TemplateRef<unknown> | null>(null);

  setTemplate(template: TemplateRef<unknown>): void {
    this.template.set(template);
  }

  clearTemplate(template: TemplateRef<unknown>): void {
    if (this.template() === template) {
      this.template.set(null);
    }
  }
}
