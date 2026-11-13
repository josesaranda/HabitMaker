import {
  Component,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { HabitMakerUIButtonDay } from '../habit-maker-ui-button-day/habit-maker-ui-button-day';
import { HabitMakerUIIcon } from '../habit-maker-ui-icon/habit-maker-ui-icon';

export interface HabitMakerUIDaySelectorDay {
  date: string;
  dayOfMonth: number;
  completed: boolean;
  offset: number;
  buffer: boolean;
  entering: boolean;
  disabled: boolean;
  ariaLabel: string;
}

export type HabitMakerUIDaySelectorNavigation = {
  direction: 'previous' | 'next';
  days: number;
};

export interface HabitMakerUIDaySelectorToggleEvent {
  date: string;
  completed: boolean;
}

@Component({
  selector: 'habit-maker-ui-day-selector',
  imports: [HabitMakerUIButtonDay, HabitMakerUIIcon],
  templateUrl: './habit-maker-ui-day-selector.html',
  styleUrl: './habit-maker-ui-day-selector.css',
  host: { class: 'hm-day-selector__host' },
})
export class HabitMakerUIDaySelector {
  readonly days = input.required<readonly HabitMakerUIDaySelectorDay[]>();
  readonly localeDays = input<readonly string[]>([
    'M',
    'T',
    'W',
    'T',
    'F',
    'S',
    'S',
  ]);
  readonly showNavigation = input(false, { transform: booleanAttribute });
  readonly dayToggleEnabled = input(true);
  readonly dayToggleDisabled = input(false);
  readonly canNavigateNext = input(true);
  readonly previousLabel = input('Show previous days');
  readonly nextLabel = input('Show next days');
  readonly navigation = output<HabitMakerUIDaySelectorNavigation>();
  readonly dayToggled = output<HabitMakerUIDaySelectorToggleEvent>();

  protected readonly dragOffset = signal(0);
  protected readonly isDragging = signal(false);
  private readonly pointerStart = signal<{
    x: number;
    y: number;
    cellWidth: number;
    pointerId: number;
    target: HTMLElement;
    captured: boolean;
  } | null>(null);
  private readonly snapDirection = signal<'previous' | 'next' | null>(null);
  private readonly snapDayCount = signal(0);
  protected readonly navigationDirection = signal<'previous' | 'next'>('next');

  protected readonly visibleDays = computed(() =>
    this.days().map((day, index) => ({
      ...day,
      weekday:
        this.localeDays()[this.getWeekdayIndex(day.date)] ??
        this.localeDays()[index % Math.max(this.localeDays().length, 1)] ??
        '',
    })),
  );

  protected readonly firstDayOffset = computed(
    () => this.days()[this.days().length > 7 ? 3 : 0]?.offset ?? -6,
  );

  protected readonly isAtFutureLimit = computed(() => {
    const visibleDays =
      this.days().length > 7 ? this.days().slice(3, 10) : this.days();
    return (visibleDays.at(-1)?.offset ?? 0) >= 0;
  });

  protected showPreviousDays(): void {
    this.navigationDirection.set('previous');
    this.navigation.emit({ direction: 'previous', days: 3 });
  }

  protected showNextDays(): void {
    if (this.isAtFutureLimit() || !this.canNavigateNext()) return;
    this.navigationDirection.set('next');
    this.navigation.emit({ direction: 'next', days: 3 });
  }

  protected startDaySwipe(event: PointerEvent): void {
    if (
      !this.showNavigation() ||
      this.snapDirection() !== null ||
      (event.pointerType !== '' && event.isPrimary === false) ||
      event.button !== 0
    ) {
      return;
    }

    const target = event.currentTarget as HTMLElement;
    const cellWidth = target.getBoundingClientRect().width / 7;
    if (cellWidth <= 0) return;

    this.pointerStart.set({
      x: event.clientX,
      y: event.clientY,
      cellWidth,
      pointerId: event.pointerId,
      target,
      captured: false,
    });
    this.dragOffset.set(0);
    this.isDragging.set(true);
  }

  protected moveDaySwipe(event: PointerEvent): void {
    const start = this.pointerStart();
    if (!start) return;

    const distance = event.clientX - start.x;
    const verticalDistance = event.clientY - start.y;
    if (
      !start.captured &&
      Math.abs(verticalDistance) >= 8 &&
      Math.abs(verticalDistance) > Math.abs(distance)
    ) {
      this.cancelDaySwipe();
      return;
    }

    if (
      !start.captured &&
      Math.abs(distance) >= 8 &&
      Math.abs(distance) >= Math.abs(verticalDistance) &&
      typeof start.target.setPointerCapture === 'function' &&
      start.pointerId >= 0
    ) {
      start.target.setPointerCapture(start.pointerId);
      this.pointerStart.set({ ...start, captured: true });
    }

    const maximumFutureDays = Math.min(
      3,
      Math.max(0, -6 - this.firstDayOffset()),
    );
    this.dragOffset.set(
      Math.min(
        3 * start.cellWidth,
        Math.max(-maximumFutureDays * start.cellWidth, distance),
      ),
    );
  }

  protected finishDaySwipe(event: PointerEvent): void {
    const start = this.pointerStart();
    if (!start) return;

    this.moveDaySwipe(event);
    const offset = this.dragOffset();
    const threshold = start.cellWidth / 2;
    const direction =
      offset >= threshold
        ? 'previous'
        : offset <= -threshold &&
            this.firstDayOffset() < -6 &&
            this.canNavigateNext()
          ? 'next'
          : null;
    const availableDays =
      direction === 'previous'
        ? 3
        : direction === 'next'
          ? Math.min(3, -6 - this.firstDayOffset())
          : 0;
    const dayCount = Math.min(
      availableDays,
      Math.round(Math.abs(offset) / start.cellWidth),
    );
    const resolvedDirection = dayCount > 0 ? direction : null;
    const targetOffset =
      resolvedDirection === 'previous'
        ? dayCount * start.cellWidth
        : resolvedDirection === 'next'
          ? -dayCount * start.cellWidth
          : 0;

    this.pointerStart.set(null);
    this.snapDirection.set(resolvedDirection);
    this.snapDayCount.set(dayCount);
    this.isDragging.set(false);
    this.dragOffset.set(targetOffset);

    if (resolvedDirection) event.preventDefault();
    if (resolvedDirection && Math.abs(targetOffset - offset) < 1) {
      this.completeDaySnap();
    }
  }

  protected cancelDaySwipe(): void {
    if (!this.pointerStart()) return;
    this.pointerStart.set(null);
    this.snapDirection.set(null);
    this.snapDayCount.set(0);
    this.isDragging.set(false);
    this.dragOffset.set(0);
  }

  protected completeDaySnap(event?: TransitionEvent): void {
    if (event && event.propertyName !== 'transform') return;
    const direction = this.snapDirection();
    if (!direction) return;

    const days = this.snapDayCount();
    this.snapDirection.set(null);
    this.snapDayCount.set(0);
    this.isDragging.set(true);
    this.dragOffset.set(0);
    this.navigationDirection.set(direction);
    this.navigation.emit({ direction, days });
    requestAnimationFrame(() => this.isDragging.set(false));
  }

  protected toggleDay(
    day: HabitMakerUIDaySelectorDay,
  ): void {
    if (
      !this.dayToggleEnabled() ||
      this.dayToggleDisabled() ||
      day.disabled ||
      day.offset > 0 ||
      day.buffer
    ) {
      return;
    }

    this.dayToggled.emit({
      date: day.date,
      completed: !day.completed,
    });
  }

  private getWeekdayIndex(date: string): number {
    const parsedDate = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) return 0;
    return (parsedDate.getDay() + 6) % 7;
  }
}
