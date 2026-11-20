import { Component, computed, input } from '@angular/core';

export type HabitMakerUIIconName =
  | 'add'
  | 'archive'
  | 'archive-check'
  | 'archive-off'
  | 'arrow-right'
  | 'arrow-left'
  | 'brand-mark'
  | 'calendar'
  | 'check'
  | 'chevron-left'
  | 'chevron-right'
  | 'clock'
  | 'close'
  | 'edit'
  | 'eye'
  | 'eye-off'
  | 'flame'
  | 'logout'
  | 'sparkle'
  | 'settings'
  | 'sprout'
  | 'unarchive';

const ICON_PATHS: Record<HabitMakerUIIconName, string> = {
  add: 'assets/icons/add.svg#add',
  archive: 'assets/icons/archive.svg#archive',
  'archive-check': 'assets/icons/archive-check.svg#archive-check',
  'archive-off': 'assets/icons/archive-off.svg#archive-off',
  'arrow-right': 'assets/icons/arrow-right.svg#arrow-right',
  'arrow-left': 'assets/icons/arrow-left.svg#arrow-left',
  'brand-mark': 'assets/icons/brand-mark.svg#brand-mark',
  calendar: 'assets/icons/calendar.svg#calendar',
  check: 'assets/icons/check.svg#check',
  'chevron-left': 'assets/icons/chevron-left.svg#chevron-left',
  'chevron-right': 'assets/icons/chevron-right.svg#chevron-right',
  clock: 'assets/icons/clock.svg#clock',
  close: 'assets/icons/close.svg#close',
  edit: 'assets/icons/edit.svg#edit',
  eye: 'assets/icons/eye.svg#eye',
  'eye-off': 'assets/icons/eye-off.svg#eye-off',
  flame: 'assets/icons/flame.svg#flame',
  logout: 'assets/icons/logout.svg#logout',
  sparkle: 'assets/icons/sparkle.svg#sparkle',
  settings: 'assets/icons/settings.svg#settings',
  sprout: 'assets/icons/sprout.svg#sprout',
  unarchive: 'assets/icons/unarchive.svg#unarchive',
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
