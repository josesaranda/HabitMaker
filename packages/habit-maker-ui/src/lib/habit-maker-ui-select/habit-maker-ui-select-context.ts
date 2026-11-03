import { InjectionToken, Signal } from '@angular/core';

export interface HabitMakerUISelectContext {
  readonly selectedValue: Signal<string | null>;
  readonly activeOptionId: Signal<string | null>;
  selectOption(value: string): void;
}

export const HABIT_MAKER_UI_SELECT_CONTEXT =
  new InjectionToken<HabitMakerUISelectContext>('HabitMakerUISelectContext');
