import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { HabitMakerUINotification } from './habit-maker-ui-notification';

@Component({
  imports: [HabitMakerUINotification],
  template: `
    <button
      #trigger
      class="test-trigger"
      type="button"
      (click)="notification.openFrom(trigger)"
    >
      Open notification
    </button>
    <hm-notification #notification type="success" label="Habit completed">
      Congratulations! You have completed a habit.
    </hm-notification>
  `,
})
class NotificationHost {}

function mockNativeDialog(dialog: HTMLDialogElement): void {
  Object.defineProperty(dialog, 'showModal', {
    configurable: true,
    value: () => dialog.setAttribute('open', ''),
  });
  Object.defineProperty(dialog, 'close', {
    configurable: true,
    value: () => dialog.removeAttribute('open'),
  });
}

describe('HabitMakerUINotification', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationHost],
    }).compileComponents();
  });

  it('renders type and position classes', () => {
    const fixture = TestBed.createComponent(NotificationHost);
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('dialog');
    expect(dialog.getAttribute('aria-label')).toBe('Habit completed');
    expect(dialog.className).toContain('hm-notification--success');
    expect(dialog.className).toContain('hm-notification--top-right');
    expect(dialog.querySelector('hm-icon')).not.toBeNull();
  });

  it('opens and closes restoring focus', () => {
    const fixture = TestBed.createComponent(NotificationHost);
    fixture.detectChanges();
    const trigger =
      fixture.nativeElement.querySelector<HTMLButtonElement>('.test-trigger')!;
    const dialog =
      fixture.nativeElement.querySelector<HTMLDialogElement>('dialog')!;
    const notification = fixture.debugElement.query(
      By.directive(HabitMakerUINotification),
    ).componentInstance as HabitMakerUINotification;
    mockNativeDialog(dialog);

    trigger.click();
    expect(dialog.open).toBe(true);

    notification.close();
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('auto closes after the configured duration', async () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(NotificationHost);
    fixture.detectChanges();
    const trigger =
      fixture.nativeElement.querySelector<HTMLButtonElement>('.test-trigger')!;
    const dialog =
      fixture.nativeElement.querySelector<HTMLDialogElement>('dialog')!;
    mockNativeDialog(dialog);

    trigger.click();
    expect(dialog.open).toBe(true);

    await vi.advanceTimersByTimeAsync(3000);
    expect(dialog.open).toBe(false);

    vi.useRealTimers();
  });

  it('closes on Escape', () => {
    const fixture = TestBed.createComponent(NotificationHost);
    fixture.detectChanges();
    const trigger =
      fixture.nativeElement.querySelector<HTMLButtonElement>('.test-trigger')!;
    const dialog =
      fixture.nativeElement.querySelector<HTMLDialogElement>('dialog')!;
    mockNativeDialog(dialog);
    trigger.click();

    const cancelEvent = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancelEvent);

    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(dialog.open).toBe(false);
  });
});
