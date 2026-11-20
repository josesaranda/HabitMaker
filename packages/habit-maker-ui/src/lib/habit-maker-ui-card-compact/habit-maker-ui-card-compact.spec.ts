import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import confetti from '@hiseb/confetti';
import { HabitMakerUICardCompact } from './habit-maker-ui-card-compact';

vi.mock('@hiseb/confetti', () => ({ default: vi.fn() }));

@Component({
  imports: [HabitMakerUICardCompact],
  template: `
    <hm-card-compact
      emoji="📚"
      [selected]="selected()"
      actionLabel="Mark reading as completed"
      (toggle)="handleToggle($event)"
    >
      Read for twenty minutes
    </hm-card-compact>
  `,
})
class CardCompactHost {
  readonly selected = signal(false);
  readonly toggledValues: boolean[] = [];

  handleToggle(selected: boolean): void {
    this.toggledValues.push(selected);
    this.selected.set(selected);
  }
}

@Component({
  imports: [HabitMakerUICardCompact],
  template: `
    <hm-card-compact emoji="🚶" selected> Take a morning walk </hm-card-compact>
  `,
})
class SelectedCardCompactHost {}

@Component({
  imports: [HabitMakerUICardCompact],
  template: ` <hm-card-compact>Build a new habit</hm-card-compact> `,
})
class NoEmojiCardCompactHost {}

@Component({
  imports: [HabitMakerUICardCompact],
  template: `
    <hm-card-compact emoji="📓" disabled>Write in my journal</hm-card-compact>
  `,
})
class DisabledCardCompactHost {}

describe('HabitMakerUICardCompact', () => {
  let fixture: ComponentFixture<CardCompactHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardCompactHost],
    }).compileComponents();
    fixture = TestBed.createComponent(CardCompactHost);
    fixture.detectChanges();
    vi.mocked(confetti).mockClear();
  });

  it('renders the emoji and the projected habit name', () => {
    const card = fixture.nativeElement.querySelector(
      'hm-card-compact',
    ) as HTMLElement;

    expect(
      card.querySelector('.hm-card-compact__emoji-value')?.textContent?.trim(),
    ).toBe('📚');
    expect(
      card.querySelector('.hm-card-compact__name')?.textContent?.trim(),
    ).toBe('Read for twenty minutes');
  });

  it('falls back to the brand icon when no emoji is provided', () => {
    const noEmojiFixture = TestBed.createComponent(NoEmojiCardCompactHost);
    noEmojiFixture.detectChanges();
    const card = noEmojiFixture.nativeElement.querySelector(
      'hm-card-compact',
    ) as HTMLElement;

    expect(
      card.querySelector('.hm-card-compact__emoji hm-icon[name="sprout"]'),
    ).not.toBeNull();
    expect(card.querySelector('.hm-card-compact__emoji-value')).toBeNull();
  });

  it('renders an unselected toggle with an accessible label', () => {
    const card = fixture.nativeElement.querySelector(
      'hm-card-compact',
    ) as HTMLElement;
    const button = card.querySelector<HTMLButtonElement>(
      '.hm-card-compact__toggle button',
    );

    expect(button?.type).toBe('button');
    expect(button?.getAttribute('aria-label')).toBe(
      'Mark reading as completed',
    );
    expect(button?.getAttribute('aria-pressed')).toBe('false');
    expect(button?.querySelector('hm-icon[name="check"]')).toBeNull();
  });

  it('emits the next selected state when the toggle is clicked', () => {
    const host = fixture.componentInstance;
    const button = fixture.nativeElement.querySelector(
      '.hm-card-compact__toggle button',
    ) as HTMLButtonElement;

    button.click();
    fixture.detectChanges();
    button.click();
    fixture.detectChanges();

    expect(host.toggledValues).toEqual([true, false]);
    expect(button.getAttribute('aria-pressed')).toBe('false');
  });

  it('celebrates with confetti only when the habit is marked', () => {
    const button = fixture.nativeElement.querySelector(
      '.hm-card-compact__toggle button',
    ) as HTMLButtonElement;
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(10, 20, 30, 40),
    );

    button.click();
    fixture.detectChanges();

    expect(confetti).toHaveBeenCalledTimes(1);
    expect(confetti).toHaveBeenCalledWith({
      position: { x: 25, y: 40 },
      color: ['#a8c5ad', '#e6b875', '#ffffff'],
    });

    button.click();
    fixture.detectChanges();

    expect(confetti).toHaveBeenCalledTimes(1);
  });

  it('supports the selected attribute and shows the check icon', () => {
    const selectedFixture = TestBed.createComponent(SelectedCardCompactHost);
    selectedFixture.detectChanges();
    const card = selectedFixture.nativeElement.querySelector(
      'hm-card-compact',
    ) as HTMLElement;
    const button = card.querySelector<HTMLButtonElement>(
      '.hm-card-compact__toggle button',
    );

    expect(card.classList.contains('hm-card-compact--selected')).toBe(true);
    expect(button?.getAttribute('aria-pressed')).toBe('true');
    expect(button?.querySelector('hm-icon[name="check"]')).not.toBeNull();
  });

  it('disables the toggle when the card is disabled', () => {
    const disabledFixture = TestBed.createComponent(DisabledCardCompactHost);
    disabledFixture.detectChanges();
    const button = disabledFixture.nativeElement.querySelector(
      '.hm-card-compact__toggle button',
    ) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
  });
});
