import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EMPTY, of, Subject } from 'rxjs';
import { Habit } from '../habits/habit.service';
import { HabitService } from '../habits/habit.service';
import { Home } from './home';

describe('Home', () => {
  const renderHome = async (habits: Habit[] = []) => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        {
          provide: HabitService,
          useValue: { getHabits: () => of(habits), habitCreated$: EMPTY },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  };

  it('opens the first-habit modal from the welcome call to action', async () => {
    const fixture = await renderHome();
    const compiled = fixture.nativeElement as HTMLElement;

    const dialog = compiled.querySelector<HTMLDialogElement>('dialog')!;
    Object.defineProperty(dialog, 'showModal', {
      configurable: true,
      value: () => dialog.setAttribute('open', ''),
    });

    compiled
      .querySelector<HTMLButtonElement>('[data-testid="home-add-habit"]')!
      .click();

    expect(dialog.open).toBe(true);
    expect(dialog.getAttribute('aria-label')).toBe(
      '¿Qué hábito quieres crear?',
    );
    expect(dialog.querySelector('app-new-habit')).not.toBeNull();
    expect(
      dialog.querySelector('label[for="new-habit-name"]')?.textContent,
    ).toContain('Tu hábito');
    expect(dialog.querySelector('input#new-habit-name')).not.toBeNull();
    expect(dialog.textContent).toContain('Comenzar hábito');
  });

  it('hides the call to action and shows a card for each saved habit', async () => {
    const fixture = await renderHome([
      {
        id: 'habit-1',
        name: 'Leer 10 minutos',
        createdAt: '2026-11-01T00:00:00.000Z',
        updatedAt: '2026-11-01T00:00:00.000Z',
      },
      {
        id: 'habit-2',
        name: 'Caminar',
        createdAt: '2026-11-02T00:00:00.000Z',
        updatedAt: '2026-11-02T00:00:00.000Z',
      },
    ]);
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('[data-testid="home-add-habit"]')).toBeNull();
    expect(compiled.querySelector('[data-testid="home-welcome"]')).toBeNull();
    expect(compiled.querySelector('#home-title')).toBeNull();
    expect(compiled.querySelectorAll('app-habit-card')).toHaveLength(2);
    expect(
      compiled.querySelector('app-habit-card article')?.classList.contains('mx-auto'),
    ).toBe(true);
    expect(compiled.textContent).toContain('Leer 10 minutos');
    expect(compiled.textContent).toContain('Caminar');
  });

  it('reloads the list when a habit is created from the global modal', async () => {
    const habitCreated = new Subject<void>();
    const habit: Habit = {
      id: 'habit-1',
      name: 'Leer 10 minutos',
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
    };
    let requestCount = 0;

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        {
          provide: HabitService,
          useValue: {
            getHabits: () => of(requestCount++ === 0 ? [] : [habit]),
            habitCreated$: habitCreated.asObservable(),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-habit-card')).toBeNull();

    habitCreated.next();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('app-habit-card'),
    ).not.toBeNull();
  });
});
