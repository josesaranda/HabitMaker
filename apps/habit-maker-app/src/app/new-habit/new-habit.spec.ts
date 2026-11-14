import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideTranslocoTesting } from '../../../test-support/transloco-testing';
import { HabitService } from '../habits/habit.service';
import { NewHabit } from './new-habit';

describe('NewHabit', () => {
  let fixture: ComponentFixture<NewHabit>;
  let submittedHabits: Array<{ name: string; emoji: string | null }>;

  beforeEach(async () => {
    submittedHabits = [];
    await TestBed.configureTestingModule({
      imports: [NewHabit],
      providers: [
        provideTranslocoTesting(),
        {
          provide: HabitService,
          useValue: {
            createHabit: (name: string, emoji: string | null) => {
              submittedHabits.push({ name, emoji });
              return of({
                id: 'habit-1',
                name,
                emoji,
                createdAt: '',
                updatedAt: '',
              });
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewHabit);
    await fixture.whenStable();
  });

  it('renders the habit name field and start button', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('label[for="new-habit-name"]')?.textContent,
    ).toContain('Tu hábito');
    expect(compiled.querySelector('input#new-habit-name')).not.toBeNull();
    expect(
      compiled.querySelector('habit-maker-ui-emoji-picker'),
    ).not.toBeNull();
    expect(
      compiled.querySelector(
        'habit-maker-ui-emoji-picker .hm-emoji-picker__option[aria-pressed="true"]',
      )?.getAttribute('aria-label'),
    ).toBe('Sin emoji');
    expect(compiled.textContent).toContain('Comenzar hábito');
  });

  it('enables the start button only when the habit name has non-whitespace content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const habitInput =
      compiled.querySelector<HTMLInputElement>('#new-habit-name')!;
    const startButton = compiled.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    )!;

    expect(startButton.disabled).toBe(true);

    habitInput.value = 'Leer 10 minutos';
    habitInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(startButton.disabled).toBe(false);

    habitInput.value = '   ';
    habitInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(startButton.disabled).toBe(true);
  });

  it('submits the habit and emits success after the API responds', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const habitInput =
      compiled.querySelector<HTMLInputElement>('#new-habit-name')!;
    let emittedCreatedEvent = false;
    fixture.componentInstance.habitCreated.subscribe(() => {
      emittedCreatedEvent = true;
    });

    habitInput.value = '  Leer 10 minutos  ';
    habitInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    compiled
      .querySelector<HTMLFormElement>('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(submittedHabits).toEqual([{ name: 'Leer 10 minutos', emoji: null }]);
    expect(emittedCreatedEvent).toBe(true);
    expect(habitInput.value).toBe('');
  });

  it('submits the selected emoji with the habit', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const habitInput =
      compiled.querySelector<HTMLInputElement>('#new-habit-name')!;
    habitInput.value = 'Leer';
    habitInput.dispatchEvent(new Event('input'));
    Array.from(
      compiled.querySelectorAll<HTMLButtonElement>(
        'habit-maker-ui-emoji-picker button',
      ),
    )
      .find((button) => button.textContent?.trim() === '📚')!
      .click();
    fixture.detectChanges();
    compiled
      .querySelector<HTMLFormElement>('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(submittedHabits).toEqual([{ name: 'Leer', emoji: '📚' }]);
  });
});
