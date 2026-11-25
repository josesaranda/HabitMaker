import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { HabitMakerUIButtonDay } from '../habit-maker-ui-button-day/habit-maker-ui-button-day';
import { HabitMakerUIIcon } from '../habit-maker-ui-icon/habit-maker-ui-icon';
import { HabitMakerUIText } from '../habit-maker-ui-text/habit-maker-ui-text';

export interface HabitMakerUICalendarDay {
  date: string;
  dayOfMonth: number;
  completed: boolean;
  disabled: boolean;
  today: boolean;
  ariaLabel: string;
}

export interface HabitMakerUICalendarToggleEvent {
  date: string;
  completed: boolean;
}

@Component({
  selector: 'hm-calendar',
  imports: [HabitMakerUIButtonDay, HabitMakerUIIcon, HabitMakerUIText],
  templateUrl: './habit-maker-ui-calendar.html',
  styleUrl: './habit-maker-ui-calendar.css',
  host: { class: 'hm-calendar__host' },
})
export class HabitMakerUICalendar {
  readonly month = input<string | Date | null>(null);
  readonly completedDates = input<readonly string[]>([]);
  readonly locale = input('en');
  readonly localeDays = input<readonly string[]>([
    'M',
    'T',
    'W',
    'T',
    'F',
    'S',
    'S',
  ]);
  readonly dayToggleEnabled = input(true);
  readonly dayToggleDisabled = input(false);
  readonly canNavigateNext = input(true);
  readonly canNavigatePrevious = input(true);
  readonly previousLabel = input('Show previous month');
  readonly nextLabel = input('Show next month');

  readonly dayToggled = output<HabitMakerUICalendarToggleEvent>();
  readonly monthChange = output<string>();

  private readonly displayedMonth = signal(new Date());
  private readonly completionOverrides = signal<Record<string, boolean>>({});

  constructor() {
    effect(() => {
      const parsed = this.parseMonth(this.month());
      if (parsed) {
        this.displayedMonth.set(parsed);
      }
    });
  }

  protected readonly monthLabel = computed(() =>
    new Intl.DateTimeFormat(this.locale(), {
      month: 'long',
      year: 'numeric',
    }).format(this.displayedMonth()),
  );

  protected readonly isCurrentMonth = computed(() => {
    const displayed = this.displayedMonth();
    const now = new Date();
    return (
      displayed.getFullYear() === now.getFullYear() &&
      displayed.getMonth() === now.getMonth()
    );
  });

  protected readonly completedSet = computed(() => {
    const completed = new Set<string>();

    for (const date of this.completedDates()) {
      completed.add(date);
    }

    return completed;
  });

  protected readonly calendarDays = computed(() => {
    const monthDate = this.displayedMonth();
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const leadingEmpty = (firstDay.getDay() + 6) % 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: HabitMakerUICalendarDay[] = [];

    // Fill the leading slots with the previous month's trailing days.
    for (let offset = -leadingEmpty; offset < 0; offset += 1) {
      const date = new Date(year, month, 1 + offset);
      const dateString = this.toLocalDate(date);
      days.push({
        date: dateString,
        dayOfMonth: date.getDate(),
        completed: false,
        disabled: true,
        today: false,
        ariaLabel: `Day ${date.getDate()} of previous month`,
      });
    }

    for (let dayOfMonth = 1; dayOfMonth <= lastDay.getDate(); dayOfMonth += 1) {
      const date = new Date(year, month, dayOfMonth);
      const dateString = this.toLocalDate(date);
      const completed =
        this.completionOverrides()[dateString] ??
        this.completedSet().has(dateString);
      const isToday = date.getTime() === today.getTime();
      const isFuture = date.getTime() > today.getTime();
      const disabled =
        !this.dayToggleEnabled() || this.dayToggleDisabled() || isFuture;
      days.push({
        date: dateString,
        dayOfMonth,
        completed,
        disabled,
        today: isToday,
        ariaLabel: this.getDayAriaLabel(dateString, completed, isFuture),
      });
    }

    // Fill the trailing slots with the next month's leading days.
    while (days.length < 42) {
      const offset = days.length - leadingEmpty - lastDay.getDate();
      const date = new Date(year, month, lastDay.getDate() + 1 + offset);
      const dateString = this.toLocalDate(date);
      days.push({
        date: dateString,
        dayOfMonth: date.getDate(),
        completed: false,
        disabled: true,
        today: false,
        ariaLabel: `Day ${date.getDate()} of next month`,
      });
    }

    return days;
  });

  protected readonly canGoPrevious = computed(() => this.canNavigatePrevious());

  protected readonly canGoNext = computed(() => {
    if (!this.canNavigateNext()) return false;

    const displayed = this.displayedMonth();
    const now = new Date();
    if (displayed.getFullYear() < now.getFullYear()) return true;
    if (displayed.getFullYear() > now.getFullYear()) return false;
    return displayed.getMonth() < now.getMonth();
  });

  protected previousMonth(): void {
    if (!this.canGoPrevious()) return;

    const nextMonth = new Date(this.displayedMonth());
    nextMonth.setMonth(nextMonth.getMonth() - 1);
    this.displayedMonth.set(nextMonth);
    this.emitMonthChange();
  }

  protected nextMonth(): void {
    if (!this.canGoNext()) return;

    const nextMonth = new Date(this.displayedMonth());
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    this.displayedMonth.set(nextMonth);
    this.emitMonthChange();
  }

  protected toggleDay(day: HabitMakerUICalendarDay): void {
    if (!day.date || day.disabled) return;

    const completed = !day.completed;
    this.completionOverrides.update((overrides) => ({
      ...overrides,
      [day.date as string]: completed,
    }));

    const event: HabitMakerUICalendarToggleEvent = {
      date: day.date,
      completed,
    };

    this.dayToggled.emit(event);
  }

  private emitMonthChange(): void {
    const monthStart = this.toLocalDate(
      new Date(
        this.displayedMonth().getFullYear(),
        this.displayedMonth().getMonth(),
        1,
      ),
    );

    this.monthChange.emit(monthStart);
  }

  private parseMonth(value: string | Date | null): Date | null {
    if (value === null) {
      const today = new Date();
      return new Date(today.getFullYear(), today.getMonth(), 1);
    }

    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) return null;
      return new Date(value.getFullYear(), value.getMonth(), 1);
    }

    const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value.trim());
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]) - 1;
      const date = new Date(year, month, 1);
      if (date.getFullYear() !== year || date.getMonth() !== month) {
        return null;
      }
      return date;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
  }

  private getDayAriaLabel(
    date: string,
    completed: boolean,
    isFuture: boolean,
  ): string {
    if (isFuture) {
      return `Cannot complete ${date}`;
    }

    return completed
      ? `Unmark ${date} as complete`
      : `Mark ${date} as complete`;
  }

  private toLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
