import { NgTemplateOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HabitMakerUIHeaderPortalService } from './habit-maker-ui-header-portal.service';

@Component({
  selector: 'habit-maker-ui-header-outlet',
  standalone: true,
  imports: [NgTemplateOutlet],
  styleUrl: './habit-maker-ui-header-outlet.css',
  template: `
    @if (headerPortal.template(); as template) {
      <ng-container [ngTemplateOutlet]="template" />
    }
  `,
})
export class HabitMakerUIHeaderOutlet {
  protected readonly headerPortal = inject(HabitMakerUIHeaderPortalService);
}
