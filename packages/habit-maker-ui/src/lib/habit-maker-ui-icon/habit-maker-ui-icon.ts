import { Component, computed, input } from '@angular/core';

export type HabitMakerUIIconName =
  | 'add'
  | 'check'
  | 'clock'
  | 'logout'
  | 'settings';

const ICON_PATHS: Record<HabitMakerUIIconName, string> = {
  add: 'assets/icons/add.svg#add',
  check: 'assets/icons/check.svg#check',
  clock: 'assets/icons/clock.svg#clock',
  logout: 'assets/icons/logout.svg#logout',
  settings: 'assets/icons/settings.svg#settings',
};

@Component({
  selector: 'hm-icon',
  standalone: true,
  templateUrl: './habit-maker-ui-icon.html',
  styleUrl: './habit-maker-ui-icon.css',
})
export class HabitMakerUIIcon {
  name = input.required<HabitMakerUIIconName>();
  protected iconPath = computed(() => ICON_PATHS[this.name()]);
}
