import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HabitMakerUICard } from './habit-maker-ui-card';

@Component({
  imports: [HabitMakerUICard],
  template: `
    <habit-maker-ui-card since="2024-03-09" emoji="📚">
      <h2 hmCardTitle>Build a reading habit</h2>
      <p class="projected-content">Projected content</p>
    </habit-maker-ui-card>
  `,
})
class CardHost {}

@Component({
  imports: [HabitMakerUICard],
  template: `
    <habit-maker-ui-card
      since="2024-03-09"
      link="/habits/habit-1"
      linkLabel="View Build a reading habit"
    >
      <h2 hmCardTitle>Build a reading habit</h2>
    </habit-maker-ui-card>
  `,
})
class CardWithLinkHost {}

@Component({
  imports: [HabitMakerUICard],
  template: `
    <habit-maker-ui-card
      since="2024-03-09"
      emoji="📚"
      [streak]="12"
      streakLabel="12 day streak"
    >
      <h2 hmCardTitle>Build a reading habit</h2>
    </habit-maker-ui-card>
  `,
})
class CardWithStreakHost {}

describe('HabitMakerUICard', () => {
  let fixture: ComponentFixture<CardHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardHost],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(CardHost);
    fixture.detectChanges();
  });

  it('projects the title and content and shows the since date with a clock icon', () => {
    const card = fixture.nativeElement.querySelector(
      'habit-maker-ui-card',
    ) as HTMLElement;

    expect(card.querySelector('[hmCardTitle]')?.textContent?.trim()).toBe(
      'Build a reading habit',
    );
    expect(card.querySelector('.hm-card__icon')?.textContent?.trim()).toBe(
      '📚',
    );
    expect(card.querySelector('.projected-content')?.textContent?.trim()).toBe(
      'Projected content',
    );
    expect(card.querySelector('time')?.getAttribute('datetime')).toBe(
      '2024-03-09',
    );
    expect(card.querySelector('time')?.textContent).toContain('Mar 9, 2024');
    expect(
      card.querySelector('habit-maker-ui-icon[name="clock"]'),
    ).not.toBeNull();
    expect(card.querySelector('.hm-card__link')).toBeNull();
  });

  it('renders a separate details link only when a destination is provided', async () => {
    const fixture = TestBed.createComponent(CardWithLinkHost);
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector(
      'habit-maker-ui-card',
    ) as HTMLElement;
    const link = card.querySelector<HTMLAnchorElement>('.hm-card__link');

    expect(link?.getAttribute('href')).toBe('/habits/habit-1');
    expect(link?.getAttribute('aria-label')).toBe('View Build a reading habit');
    expect(
      link?.querySelector('habit-maker-ui-icon[name="arrow-right"]'),
    ).not.toBeNull();
    expect(
      card.querySelector('.hm-card__icon habit-maker-ui-icon[name="sprout"]'),
    ).not.toBeNull();
    expect(card.querySelector('.hm-card__icon .hm-card__emoji')).toBeNull();
    expect(card.querySelector('article')?.closest('a')).toBeNull();
  });

  it('shows the streak with a flame icon and an accessible label', async () => {
    const fixture = TestBed.createComponent(CardWithStreakHost);
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector(
      'habit-maker-ui-card',
    ) as HTMLElement;
    const streak = card.querySelector('.hm-card__streak');

    expect(streak?.textContent).toContain('12');
    expect(streak?.getAttribute('aria-label')).toBe('12 day streak');
    expect(streak?.getAttribute('title')).toBe('12 day streak');
    expect(
      streak?.querySelector('habit-maker-ui-icon[name="flame"]'),
    ).not.toBeNull();
  });

  it('hides the streak when no value is provided', () => {
    const card = fixture.nativeElement.querySelector(
      'habit-maker-ui-card',
    ) as HTMLElement;

    expect(card.querySelector('.hm-card__streak')).toBeNull();
  });
});
