import { Component, output, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  HabitMakerUIBrand,
  HabitMakerUIButton,
  HabitMakerUIFormField,
  HabitMakerUIFormFieldError,
  HabitMakerUIFormFieldHint,
  HabitMakerUIFormFieldLabel,
  HabitMakerUIInput,
  HabitMakerUIText,
} from '@habit-maker/habit-maker-ui';
import {
  DEFAULT_DESKTOP_API_URL,
  getDesktopApiUrl,
  normalizeDesktopApiUrl,
  saveDesktopApiUrl,
  testDesktopApiConnection,
} from '@habit-maker/shared-data-access';

type DesktopSetupStatus = 'idle' | 'checking';

@Component({
  selector: 'app-desktop-setup',
  imports: [
    HabitMakerUIBrand,
    HabitMakerUIButton,
    HabitMakerUIFormField,
    HabitMakerUIFormFieldError,
    HabitMakerUIFormFieldHint,
    HabitMakerUIFormFieldLabel,
    HabitMakerUIInput,
    HabitMakerUIText,
    TranslocoPipe,
  ],
  templateUrl: './desktop-setup.html',
})
export class DesktopSetup {
  readonly configured = output<void>();

  protected readonly apiUrl = signal(
    getDesktopApiUrl() ?? DEFAULT_DESKTOP_API_URL,
  );
  protected readonly status = signal<DesktopSetupStatus>('idle');
  protected readonly error = signal<string | null>(null);

  protected updateApiUrl(value: string): void {
    this.apiUrl.set(value);
    this.error.set(null);
  }

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.status() === 'checking') return;

    const apiUrl = normalizeDesktopApiUrl(this.apiUrl());
    if (!apiUrl) {
      this.error.set('desktopSetup.invalidUrl');
      return;
    }

    this.error.set(null);
    this.status.set('checking');

    const reachable = await testDesktopApiConnection(apiUrl);
    this.status.set('idle');

    if (!reachable) {
      this.error.set('desktopSetup.unreachable');
      return;
    }

    saveDesktopApiUrl(apiUrl);
    this.configured.emit();
  }
}
