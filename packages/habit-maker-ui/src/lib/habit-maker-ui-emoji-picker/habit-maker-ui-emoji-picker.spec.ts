import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HabitMakerUIEmojiPicker } from './habit-maker-ui-emoji-picker';

@Component({
  imports: [HabitMakerUIEmojiPicker],
  template: `
    <fieldset>
      <legend>Choose an emoji</legend>
      <habit-maker-ui-emoji-picker
        noneOptionLabel="No emoji"
        [selectedEmoji]="selectedEmoji()"
        (emojiSelected)="selectedEmoji.set($event)"
      />
    </fieldset>
  `,
})
class EmojiPickerHost {
  selectedEmoji = signal<string | null>(null);
}

describe('HabitMakerUIEmojiPicker', () => {
  let fixture: ComponentFixture<EmojiPickerHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmojiPickerHost],
    }).compileComponents();
    fixture = TestBed.createComponent(EmojiPickerHost);
    fixture.detectChanges();
  });

  it('renders the emoji options and indicates the current selection', () => {
    const picker = fixture.nativeElement.querySelector(
      'habit-maker-ui-emoji-picker',
    ) as HTMLElement;
    const options =
      picker.querySelectorAll<HTMLButtonElement>('.hm-emoji-picker__option');

    expect(options.length).toBeGreaterThan(40);
    expect(
      picker.parentElement?.querySelector('legend')?.textContent,
    ).toBe('Choose an emoji');
    expect(
      picker.querySelector('.hm-emoji-picker__option--selected'),
    ).toBe(options[0]);
    expect(options[0].getAttribute('aria-label')).toBe('No emoji');
    expect(options[0].getAttribute('aria-pressed')).toBe('true');
    expect(options[1].getAttribute('aria-pressed')).toBe('false');
  });

  it('emits the chosen emoji and updates the selected state', () => {
    const picker = fixture.nativeElement.querySelector(
      'habit-maker-ui-emoji-picker',
    ) as HTMLElement;
    const booksOption = Array.from(
      picker.querySelectorAll<HTMLButtonElement>('.hm-emoji-picker__option'),
    ).find((option) => option.textContent?.trim() === '📚')!;

    booksOption.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedEmoji()).toBe('📚');
    expect(booksOption.getAttribute('aria-pressed')).toBe('true');
  });

  it('also selects an emoji with the space key', () => {
    const picker = fixture.nativeElement.querySelector(
      'habit-maker-ui-emoji-picker',
    ) as HTMLElement;
    const waterOption = Array.from(
      picker.querySelectorAll<HTMLButtonElement>('.hm-emoji-picker__option'),
    ).find((option) => option.textContent?.trim() === '💧')!;

    waterOption.dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', bubbles: true }),
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedEmoji()).toBe('💧');
  });

  it('clears the selected emoji when the selected button is chosen again', () => {
    const picker = fixture.nativeElement.querySelector(
      'habit-maker-ui-emoji-picker',
    ) as HTMLElement;
    const sparklesOption = Array.from(
      picker.querySelectorAll<HTMLButtonElement>('.hm-emoji-picker__option'),
    ).find((option) => option.textContent?.trim() === '✨')!;

    sparklesOption.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedEmoji()).toBe('✨');

    sparklesOption.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedEmoji()).toBeNull();
    expect(sparklesOption.getAttribute('aria-pressed')).toBe('false');
  });

  it('selects the first no-emoji option to save a null value', () => {
    const picker = fixture.nativeElement.querySelector(
      'habit-maker-ui-emoji-picker',
    ) as HTMLElement;
    const noEmojiOption = picker.querySelector<HTMLButtonElement>(
      'button[aria-label="No emoji"]',
    )!;
    const booksOption = Array.from(
      picker.querySelectorAll<HTMLButtonElement>('.hm-emoji-picker__option'),
    ).find((option) => option.textContent?.trim() === '📚')!;

    booksOption.click();
    fixture.detectChanges();
    noEmojiOption.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedEmoji()).toBeNull();
    expect(noEmojiOption.getAttribute('aria-pressed')).toBe('true');
  });
});
