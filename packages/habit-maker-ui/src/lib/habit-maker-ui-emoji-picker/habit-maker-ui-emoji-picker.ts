import { Component, input, output } from '@angular/core';
import { HabitMakerUIIcon } from '../habit-maker-ui-icon/habit-maker-ui-icon';

export const HABIT_MAKER_UI_EMOJIS = [
  '✨',
  '📚',
  '📖',
  '🏃',
  '🏋️',
  '🧘',
  '💧',
  '🥗',
  '💤',
  '💪',
  '✍️',
  '🎨',
  '🌱',
  '🪴',
  '🧹',
  '💊',
  '🐕',
  '🚴',
  '🧠',
  '🏊',
  '🧗',
  '⚽',
  '🏀',
  '🎾',
  '🏸',
  '🥾',
  '🛹',
  '🏄',
  '🍎',
  '🍌',
  '🍓',
  '🍉',
  '🍇',
  '🍊',
  '🥑',
  '🥕',
  '🍳',
  '☕',
  '🍵',
  '🥛',
  '🌅',
  '🌞',
  '🌙',
  '🌻',
  '🌼',
  '🌳',
  '🌿',
  '🍀',
  '🌵',
  '🧺',
  '🧼',
  '🛁',
  '🛏️',
  '👟',
  '🎸',
  '🎹',
  '🎧',
  '🎯',
  '🧩',
  '📈',
  '💻',
  '📝',
  '🖊️',
  '🔥',
  '🕯️',
  '🎤',
  '🎼',
  '🚶',
  '🏆',
  '🥇',
  '🧴',
] as const;

@Component({
  selector: 'habit-maker-ui-emoji-picker',
  imports: [HabitMakerUIIcon],
  templateUrl: './habit-maker-ui-emoji-picker.html',
  styleUrl: './habit-maker-ui-emoji-picker.css',
  host: { class: 'hm-emoji-picker' },
})
export class HabitMakerUIEmojiPicker {
  readonly noneOptionLabel = input.required<string>();
  readonly selectedEmoji = input<string | null>(null);
  readonly emojis = input<readonly string[]>(HABIT_MAKER_UI_EMOJIS);
  readonly emojiSelected = output<string | null>();

  protected selectEmoji(emoji: string | null): void {
    this.emojiSelected.emit(this.selectedEmoji() === emoji ? null : emoji);
  }

  protected activateOnKeydown(
    event: KeyboardEvent,
    emoji: string | null,
  ): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (event.repeat) return;

    event.preventDefault();
    this.selectEmoji(emoji);
  }
}
