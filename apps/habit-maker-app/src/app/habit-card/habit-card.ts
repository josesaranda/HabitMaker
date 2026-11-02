import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { HabitCompletionStatus, HabitService } from '../habits/habit.service';

export interface HabitCardDayToggleEvent {
  date: string;
  completed: boolean;
  position: { x: number; y: number };
}

@Component({
  imports: [NgTemplateOutlet],
  selector: 'app-habit-card',
  templateUrl: './habit-card.html',
  host: { class: 'block w-full' },
})
export class HabitCard {
  private readonly habitService = inject(HabitService);
  id = input.required<string>();
  name = input.required<string>();
  startedAt = input.required<string>();
  dayToggleEnabled = input(false);
  dayToggleDisabled = input(false);
  showDayNavigation = input(false);
  windowStartDate = input<string | null>(null);
  completionRefresh = input(0);
  dayToggled = output<HabitCardDayToggleEvent>();
  windowStartDateChange = output<string>();
  private readonly today = signal(new Date());
  private readonly firstDayOffset = computed(() =>
    this.getFirstDayOffset(this.windowStartDate()),
  );
  private readonly enteringDates = signal<Set<string>>(new Set());
  private readonly pointerStart = signal<
    {
      x: number;
      y: number;
      cellWidth: number;
      pointerId: number;
      target: HTMLElement;
      captured: boolean;
    } | null
  >(null);
  protected readonly dragOffset = signal(0);
  protected readonly isDragging = signal(false);
  private readonly snapDirection = signal<'past' | 'future' | null>(null);
  private readonly snapDayCount = signal(0);
  protected readonly navigationDirection = signal<'past' | 'future'>('future');
  private readonly completions = signal<Record<string, boolean>>({});
  protected readonly completionError = signal(false);

  private readonly calendarDays = computed(() => {
    const weekdayLabels = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    const today = new Date(this.today());
    today.setHours(0, 0, 0, 0);
    const firstDayOffset = this.firstDayOffset();

    return Array.from({ length: 13 }, (_, index) => {
      const offset = firstDayOffset + index - 3;
      const date = new Date(today);
      date.setDate(today.getDate() + offset);

      return {
        label: weekdayLabels[date.getDay()],
        dayOfMonth: date.getDate(),
        date: this.toLocalDate(date),
        offset,
        buffer: index < 3 || index > 9,
      };
    });
  });

  protected readonly days = computed(() =>
    this.calendarDays().map((day) => ({
      ...day,
      completed: this.completions()[day.date] ?? false,
      entering: this.enteringDates().has(day.date),
    })),
  );

  protected readonly isAtFutureLimit = computed(
    () => this.firstDayOffset() + 9 > 3,
  );

  protected readonly startedAtLabel = computed(() => {
    const rawDate = this.startedAt().split('T', 1)[0];
    const date = new Date(`${rawDate}T00:00:00`);

    if (Number.isNaN(date.getTime())) return rawDate;

    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  });

  constructor() {
    effect((onCleanup) => {
      const habitId = this.id();
      this.completionRefresh();
      const dates = this.calendarDays().map(({ date }) => date);
      this.completions.set({});
      this.completionError.set(false);

      const subscription = this.habitService
        .getCompletionsForDates(habitId, dates)
        .subscribe({
          next: (completions) => this.setCompletions(completions),
          error: () => this.completionError.set(true),
        });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  private setCompletions(completions: HabitCompletionStatus[]): void {
    this.completions.set(
      Object.fromEntries(
        completions.map(({ date, completed }) => [date, completed]),
      ),
    );
  }

  protected showPreviousDays(): void {
    this.moveDays(-3);
  }

  protected showNextDays(): void {
    if (this.isAtFutureLimit()) return;
    this.moveDays(3);
  }

  protected startDaySwipe(event: PointerEvent): void {
    if (
      !this.showDayNavigation() ||
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
      Math.max(0, -3 - this.firstDayOffset()),
    );
    this.dragOffset.set(
      Math.min(
        3 * start.cellWidth,
        Math.max(
          -maximumFutureDays * start.cellWidth,
          distance,
        ),
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
        ? 'past'
        : offset <= -threshold &&
            this.firstDayOffset() < -3
          ? 'future'
          : null;
    const availableDays =
      direction === 'past'
        ? 3
        : direction === 'future'
          ? Math.min(3, -3 - this.firstDayOffset())
          : 0;
    const dayCount = Math.min(
      availableDays,
      Math.round(Math.abs(offset) / start.cellWidth),
    );
    const resolvedDirection = dayCount > 0 ? direction : null;
    const targetOffset =
      resolvedDirection === 'past'
        ? dayCount * start.cellWidth
        : resolvedDirection === 'future'
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

    this.snapDirection.set(null);
    const dayCount = this.snapDayCount();
    this.snapDayCount.set(0);
    this.isDragging.set(true);
    this.dragOffset.set(0);
    this.moveDays(direction === 'past' ? -dayCount : dayCount);
    requestAnimationFrame(() => this.isDragging.set(false));
  }

  private moveDays(amount: number): void {
    const nextFirstDayOffset = this.firstDayOffset() + amount;
    if (nextFirstDayOffset + 6 > 3) return;

    const enteringOffsets =
      amount > 0
        ? Array.from(
            { length: amount },
            (_, index) => nextFirstDayOffset + 7 - amount + index,
          )
        : Array.from(
            { length: -amount },
            (_, index) => nextFirstDayOffset + index,
          );
    const today = new Date(this.today());
    today.setHours(0, 0, 0, 0);
    this.enteringDates.set(
      new Set(
        enteringOffsets.map((offset) => {
          const date = new Date(today);
          date.setDate(today.getDate() + offset);
          return this.toLocalDate(date);
        }),
      ),
    );
    this.navigationDirection.set(amount > 0 ? 'future' : 'past');
    const windowStartDate = new Date(today);
    windowStartDate.setDate(today.getDate() + nextFirstDayOffset);
    this.windowStartDateChange.emit(this.toLocalDate(windowStartDate));
  }

  private getFirstDayOffset(windowStartDate: string | null): number {
    if (!windowStartDate) return -3;

    const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(windowStartDate);
    if (!dateParts) return -3;

    const [, yearValue, monthValue, dayValue] = dateParts;
    const year = Number(yearValue);
    const month = Number(monthValue) - 1;
    const day = Number(dayValue);
    const date = new Date(year, month, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return -3;
    }

    const today = this.today();
    const startUtc = Date.UTC(year, month, day);
    const todayUtc = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    return Math.min(Math.round((startUtc - todayUtc) / 86_400_000), -3);
  }

  protected toggleDay(
    day: {
      date: string;
      completed: boolean;
      offset: number;
      buffer: boolean;
    },
    event: MouseEvent,
  ): void {
    if (
      !this.dayToggleEnabled() ||
      this.dayToggleDisabled() ||
      day.offset > 0 ||
      day.buffer
    ) {
      return;
    }

    const { left, top, width, height } = (
      event.currentTarget as HTMLButtonElement
    ).getBoundingClientRect();
    this.dayToggled.emit({
      date: day.date,
      completed: !day.completed,
      position: { x: left + width / 2, y: top + height / 2 },
    });
  }

  private toLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
