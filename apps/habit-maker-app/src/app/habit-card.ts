import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import {
  HabitMakerUICard,
  HabitMakerUIDaySelector,
} from '@habit-maker/habit-maker-ui';
import { HabitCompletionStatus, HabitService } from './habits/habit.service';
import { LanguageService } from './i18n/language.service';

export interface HabitMakerUICardDayToggleEvent {
  date: string;
  completed: boolean;
}

@Component({
  imports: [HabitMakerUICard, HabitMakerUIDaySelector],
  selector: 'app-habit-card',
  templateUrl: './habit-card.html',
  host: { class: 'block w-full' },
})
export class HabitCard {
  private readonly habitService = inject(HabitService);
  private readonly languageService = inject(LanguageService);

  readonly id = input.required<string>();
  readonly name = input.required<string>();
  readonly emoji = input<string | null>(null);
  readonly startedAt = input.required<string>();
  readonly link = input<string | null>(null);
  readonly linkLabel = input('View details');
  readonly dayToggleEnabled = input(false);
  readonly dayToggleDisabled = input(false);
  readonly showDayNavigation = input(false);
  readonly windowStartDate = input<string | null>(null);
  readonly completionUpdate = input<HabitMakerUICardDayToggleEvent | null>(
    null,
  );
  readonly previewCompletedDayOffsets = input<readonly number[] | null>(null);
  readonly dayToggled = output<HabitMakerUICardDayToggleEvent>();
  readonly windowStartDateChange = output<string>();

  protected readonly locale = this.languageService.locale;
  protected readonly labels = computed(() =>
    this.locale().startsWith('es')
      ? {
          previousDays: 'Mostrar los tres días anteriores',
          nextDays: 'Mostrar los tres días siguientes',
          completionError: 'No se pudo cargar el progreso reciente.',
        }
      : {
          previousDays: 'Show the previous three days',
          nextDays: 'Show the next three days',
          completionError: "Couldn't load recent progress.",
        },
  );

  private readonly today = signal(new Date());
  private readonly firstDayOffset = computed(() =>
    this.getFirstDayOffset(this.windowStartDate()),
  );
  private readonly enteringDates = signal<Set<string>>(new Set());
  private readonly completions = signal<Record<string, boolean>>({});
  private readonly completionOverrides = signal<Record<string, boolean>>({});
  protected readonly completionError = signal(false);

  protected readonly localeDays = computed(() => {
    const monday = new Date(2024, 0, 1);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return new Intl.DateTimeFormat(this.locale(), {
        weekday: 'narrow',
      }).format(date);
    });
  });

  private readonly calendarDays = computed(() => {
    const today = new Date(this.today());
    today.setHours(0, 0, 0, 0);
    const firstDayOffset = this.firstDayOffset();

    return Array.from({ length: 13 }, (_, index) => {
      const offset = firstDayOffset + index - 3;
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      return {
        date: this.toLocalDate(date),
        dayOfMonth: date.getDate(),
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
      disabled: day.offset > 0 || day.buffer,
      ariaLabel: this.getDayAriaLabel({
        ...day,
        completed: this.completions()[day.date] ?? false,
      }),
    })),
  );

  constructor() {
    effect((onCleanup) => {
      const habitId = this.id();
      const calendarDays = this.calendarDays();
      const previewCompletedDayOffsets = this.previewCompletedDayOffsets();
      this.completions.set({});
      this.completionOverrides.set({});
      this.completionError.set(false);

      if (previewCompletedDayOffsets !== null) {
        const completedOffsets = new Set(previewCompletedDayOffsets);
        this.completions.set(
          Object.fromEntries(
            calendarDays.map(({ date, offset }) => [
              date,
              completedOffsets.has(offset),
            ]),
          ),
        );
        return;
      }

      const dates = calendarDays.map(({ date }) => date);
      const subscription = this.habitService
        .getCompletionsForDates(habitId, dates)
        .subscribe({
          next: (completions) => this.setCompletions(completions),
          error: () => this.completionError.set(true),
        });

      onCleanup(() => subscription.unsubscribe());
    });

    effect(() => {
      const completionUpdate = this.completionUpdate();
      if (!completionUpdate) return;

      this.applyCompletion(completionUpdate);
    });
  }

  protected navigate(event: {
    direction: 'previous' | 'next';
    days: number;
  }): void {
    this.moveDays(event.direction === 'previous' ? -event.days : event.days);
  }

  protected toggleDay(event: HabitMakerUICardDayToggleEvent): void {
    if (!this.dayToggleEnabled() || this.dayToggleDisabled()) return;
    if (this.previewCompletedDayOffsets() !== null) {
      this.applyCompletion(event);
    }
    this.dayToggled.emit(event);
  }

  private applyCompletion(event: HabitMakerUICardDayToggleEvent): void {
    this.completionOverrides.update((overrides) => ({
      ...overrides,
      [event.date]: event.completed,
    }));
    this.completions.update((completions) => ({
      ...completions,
      [event.date]: event.completed,
    }));
  }

  private setCompletions(completions: HabitCompletionStatus[]): void {
    const overrides = untracked(() => this.completionOverrides());
    this.completions.set(
      Object.fromEntries(
        completions.map(({ date, completed }) => [
          date,
          overrides[date] ?? completed,
        ]),
      ),
    );
  }

  private formatDayDate(date: string): string {
    const parsedDate = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) return date;
    return new Intl.DateTimeFormat(this.locale(), {
      dateStyle: 'full',
    }).format(parsedDate);
  }

  private getDayAriaLabel(day: {
    date: string;
    offset: number;
    completed: boolean;
  }): string {
    const spanish = this.locale().startsWith('es');
    const formattedDate = this.formatDayDate(day.date);
    if (day.offset > 0) {
      return spanish
        ? `No se puede completar el día ${formattedDate}`
        : `Can't complete ${formattedDate}`;
    }

    if (spanish) {
      return day.completed
        ? `Desmarcar como completado el ${formattedDate}`
        : `Marcar como completado el ${formattedDate}`;
    }
    return day.completed
      ? `Unmark ${formattedDate} as complete`
      : `Mark ${formattedDate} as complete`;
  }

  private moveDays(amount: number): void {
    const nextFirstDayOffset = this.firstDayOffset() + amount;
    if (nextFirstDayOffset + 6 > 0) return;

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
    const windowStartDate = new Date(today);
    windowStartDate.setDate(today.getDate() + nextFirstDayOffset);
    this.windowStartDateChange.emit(this.toLocalDate(windowStartDate));
  }

  private getFirstDayOffset(windowStartDate: string | null): number {
    if (!windowStartDate) return -6;
    const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(windowStartDate);
    if (!dateParts) return -6;

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
      return -6;
    }

    const today = this.today();
    const startUtc = Date.UTC(year, month, day);
    const todayUtc = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    return Math.min(Math.round((startUtc - todayUtc) / 86_400_000), -6);
  }

  private toLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
