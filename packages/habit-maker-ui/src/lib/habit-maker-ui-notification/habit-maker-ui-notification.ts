import {
  Component,
  ElementRef,
  OnDestroy,
  computed,
  input,
  viewChild,
} from '@angular/core';
import {
  HabitMakerUIIcon,
  type HabitMakerUIIconName,
} from '../habit-maker-ui-icon/habit-maker-ui-icon';
import { HabitMakerUIText } from '../habit-maker-ui-text/habit-maker-ui-text';

export type HabitMakerUINotificationType =
  'default' | 'success' | 'warning' | 'info' | 'danger';

export type HabitMakerUINotificationPosition =
  | 'top-left'
  | 'top-right'
  | 'top-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom-center';

export interface HabitMakerUINotificationOptions {
  type?: HabitMakerUINotificationType;
  label?: string;
  content?: string;
  message?: string;
  text?: string;
  body?: string;
  position?: HabitMakerUINotificationPosition;
  duration?: number | string;
  closeLabel?: string;
}

const NOTIFICATION_ICONS: Partial<
  Record<HabitMakerUINotificationType, HabitMakerUIIconName>
> = {
  success: 'check',
  warning: 'alert-triangle',
  info: 'info',
  danger: 'x-circle',
};

function normalizeNotificationType(
  value: string,
): HabitMakerUINotificationType {
  switch (value) {
    case 'success':
    case 'warning':
    case 'info':
    case 'danger':
      return value;
    default:
      return 'default';
  }
}

function normalizeNotificationPosition(
  value: string,
): HabitMakerUINotificationPosition {
  switch (value) {
    case 'top-left':
    case 'top-right':
    case 'top-center':
    case 'bottom-left':
    case 'bottom-right':
    case 'bottom-center':
      return value;
    default:
      return 'top-right';
  }
}

function normalizeNotificationDuration(value: number | string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 3000;
}

@Component({
  selector: 'hm-notification',
  imports: [HabitMakerUIIcon, HabitMakerUIText],
  host: {
    class: 'hm-notification',
    '[class.hm-notification--default]': 'type() === "default"',
    '[class.hm-notification--success]': 'type() === "success"',
    '[class.hm-notification--warning]': 'type() === "warning"',
    '[class.hm-notification--info]': 'type() === "info"',
    '[class.hm-notification--danger]': 'type() === "danger"',
    '[class.hm-notification--top-left]': 'position() === "top-left"',
    '[class.hm-notification--top-right]': 'position() === "top-right"',
    '[class.hm-notification--top-center]': 'position() === "top-center"',
    '[class.hm-notification--bottom-left]': 'position() === "bottom-left"',
    '[class.hm-notification--bottom-right]': 'position() === "bottom-right"',
    '[class.hm-notification--bottom-center]': 'position() === "bottom-center"',
  },
  templateUrl: './habit-maker-ui-notification.html',
  styleUrl: './habit-maker-ui-notification.css',
})
export class HabitMakerUINotification implements OnDestroy {
  type = input<HabitMakerUINotificationType, string>('default', {
    transform: normalizeNotificationType,
  });
  label = input.required<string>();
  closeLabel = input('Close notification');
  position = input<HabitMakerUINotificationPosition, string>('top-right', {
    transform: normalizeNotificationPosition,
  });
  duration = input<number, number | string>(3000, {
    transform: normalizeNotificationDuration,
  });

  protected readonly icon = computed<HabitMakerUIIconName | undefined>(
    () => NOTIFICATION_ICONS[this.type()],
  );

  private readonly dialogRef =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private triggerElement: HTMLElement | null = null;
  private dismissTimer: ReturnType<typeof setTimeout> | null = null;

  /** Opens the notification without an invoking element. */
  open(): void {
    const dialog = this.dialogRef().nativeElement;
    if (dialog.open) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== dialog
        ? document.activeElement
        : null;

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }

    if (previouslyFocused?.isConnected) {
      previouslyFocused.focus({ preventScroll: true });
    } else {
      dialog.blur();
    }

    this.startDismissTimer();
  }

  /** Opens the notification and animates it from the element that invoked it. */
  openFrom(trigger: HTMLElement): void {
    const dialog = this.dialogRef().nativeElement;
    if (dialog.open) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== dialog
        ? document.activeElement
        : trigger;

    this.triggerElement = trigger;
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }

    if (previouslyFocused?.isConnected) {
      previouslyFocused.focus({ preventScroll: true });
    } else {
      trigger.focus({ preventScroll: true });
    }

    this.startDismissTimer();
  }

  /** Closes the notification and returns focus to the element that opened it. */
  close(): void {
    this.clearDismissTimer();
    const dialog = this.dialogRef().nativeElement;
    if (!dialog.open) return;

    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }

    const trigger = this.triggerElement;
    this.triggerElement = null;
    if (trigger?.isConnected && !trigger.hasAttribute('disabled'))
      trigger.focus();
  }

  protected onCancel(event: Event): void {
    event.preventDefault();
    this.close();
  }

  protected onDialogClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  private startDismissTimer(): void {
    this.clearDismissTimer();
    const duration = this.duration();
    if (duration <= 0) return;
    this.dismissTimer = setTimeout(() => this.close(), duration);
  }

  private clearDismissTimer(): void {
    if (this.dismissTimer !== null) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
  }

  ngOnDestroy(): void {
    this.clearDismissTimer();
  }
}
