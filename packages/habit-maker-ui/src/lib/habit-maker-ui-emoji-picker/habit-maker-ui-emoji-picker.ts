import { Component, computed, input, output } from '@angular/core';
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
  /** Emoji whose option is pinned as the second option, fixing the order. */
  readonly pinnedEmoji = input<string | null>(null);
  readonly emojis = input<readonly string[]>(HABIT_MAKER_UI_EMOJIS);
  readonly emojiSelected = output<string | null>();

  /** Brand option first, then the pinned emoji (when any), then the rest. */
  protected readonly orderedEmojis = computed(() => {
    const pinned = this.pinnedEmoji();
    const emojis = this.emojis();

    if (pinned === null) return emojis;

    return [pinned, ...emojis.filter((emoji) => emoji !== pinned)];
  });

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
