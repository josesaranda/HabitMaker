import { moduleMetadata } from '@storybook/angular';
import type { Meta, StoryObj } from '@storybook/angular';
import {
  HABIT_MAKER_UI_EMOJIS,
  HabitMakerUIEmojiPicker,
} from './habit-maker-ui-emoji-picker';

const meta: Meta<HabitMakerUIEmojiPicker> = {
  title: 'Forms/Emoji Picker',
  component: HabitMakerUIEmojiPicker,
  decorators: [moduleMetadata({ imports: [HabitMakerUIEmojiPicker] })],
};

export default meta;
type Story = StoryObj<HabitMakerUIEmojiPicker>;

export const Playground: Story = {
  args: {
    noneOptionLabel: 'No emoji',
    selectedEmoji: null,
    pinnedEmoji: null,
    emojis: [...HABIT_MAKER_UI_EMOJIS],
  },
  argTypes: {
    noneOptionLabel: { control: 'text' },
    selectedEmoji: {
      control: 'select',
      options: [null, ...HABIT_MAKER_UI_EMOJIS],
    },
    pinnedEmoji: {
      control: 'select',
      options: [null, ...HABIT_MAKER_UI_EMOJIS],
    },
    emojis: { control: 'object' },
    emojiSelected: { control: false },
  },
  render: (args) => ({
    props: { ...args },
    template: `
      <fieldset>
        <legend>Choose an emoji</legend>
        <habit-maker-ui-emoji-picker
          [noneOptionLabel]="noneOptionLabel"
          [selectedEmoji]="selectedEmoji"
          [pinnedEmoji]="pinnedEmoji"
          [emojis]="emojis"
          (emojiSelected)="selectedEmoji = $event"
        />
      </fieldset>
    `,
  }),
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { emojis: HABIT_MAKER_UI_EMOJIS },
    template: `
      <div style="display: grid; max-width: 28rem; gap: 1.5rem;">
        <fieldset>
          <legend>Brand icon — no emoji selected</legend>
          <habit-maker-ui-emoji-picker
            noneOptionLabel="No emoji"
            [emojis]="emojis"
          />
        </fieldset>
        <fieldset>
          <legend>Reading habit — selected and pinned</legend>
          <habit-maker-ui-emoji-picker
            noneOptionLabel="No emoji"
            selectedEmoji="📚"
            pinnedEmoji="📚"
            [emojis]="emojis"
          />
        </fieldset>
        <fieldset>
          <legend>Movement habit — selected and pinned</legend>
          <habit-maker-ui-emoji-picker
            noneOptionLabel="No emoji"
            selectedEmoji="🏃"
            pinnedEmoji="🏃"
            [emojis]="emojis"
          />
        </fieldset>
      </div>
    `,
  }),
};
