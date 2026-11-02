import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideTranslocoTesting } from '../../../test-support/transloco-testing';
import { HabitService } from '../habits/habit.service';
import { NewHabit } from './new-habit';

describe('NewHabit', () => {
  let fixture: ComponentFixture<NewHabit>;
  let submittedNames: string[];

  beforeEach(async () => {
    submittedNames = [];
    await TestBed.configureTestingModule({
      imports: [NewHabit],
      providers: [
        provideTranslocoTesting(),
        {
          provide: HabitService,
          useValue: {
            createHabit: (name: string) => {
              submittedNames.push(name);
              return of({
                id: 'habit-1',
                name,
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

    expect(submittedNames).toEqual(['Leer 10 minutos']);
    expect(emittedCreatedEvent).toBe(true);
    expect(habitInput.value).toBe('');
  });
});
