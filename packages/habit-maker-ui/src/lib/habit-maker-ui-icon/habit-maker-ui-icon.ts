import { Component, computed, input } from '@angular/core';

export type HabitMakerUIIconName =
  | 'add'
  | 'arrow-right'
  | 'arrow-left'
  | 'brand-mark'
  | 'check'
  | 'chevron-left'
  | 'chevron-right'
  | 'clock'
  | 'close'
  | 'edit'
  | 'eye'
  | 'eye-off'
  | 'logout'
  | 'sparkle'
  | 'settings'
  | 'sprout';

const ICON_PATHS: Record<HabitMakerUIIconName, string> = {
  add: 'assets/icons/add.svg#add',
  'arrow-right': 'assets/icons/arrow-right.svg#arrow-right',
  'arrow-left': 'assets/icons/arrow-left.svg#arrow-left',
  'brand-mark': 'assets/icons/brand-mark.svg#brand-mark',
  check: 'assets/icons/check.svg#check',
  'chevron-left': 'assets/icons/chevron-left.svg#chevron-left',
  'chevron-right': 'assets/icons/chevron-right.svg#chevron-right',
  clock: 'assets/icons/clock.svg#clock',
  close: 'assets/icons/close.svg#close',
  edit: 'assets/icons/edit.svg#edit',
  eye: 'assets/icons/eye.svg#eye',
  'eye-off': 'assets/icons/eye-off.svg#eye-off',
  logout: 'assets/icons/logout.svg#logout',
  sparkle: 'assets/icons/sparkle.svg#sparkle',
  settings: 'assets/icons/settings.svg#settings',
  sprout: 'assets/icons/sprout.svg#sprout',
};

@Component({
  selector: 'habit-maker-ui-icon',
  standalone: true,
  templateUrl: './habit-maker-ui-icon.html',
  styleUrl: './habit-maker-ui-icon.css',
})
export class HabitMakerUIIcon {
  name = input.required<HabitMakerUIIconName>();
  protected iconPath = computed(() => ICON_PATHS[this.name()]);
}
