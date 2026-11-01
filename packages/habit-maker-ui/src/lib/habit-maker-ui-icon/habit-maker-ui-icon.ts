import { Component, computed, input } from '@angular/core';

export type HabitMakerUIIconName = 'add' | 'logout';

const ICON_PATHS: Record<HabitMakerUIIconName, string> = {
  add: 'assets/icons/add.svg#add',
  logout: 'assets/icons/logout.svg#logout',
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
