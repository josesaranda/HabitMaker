import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Habit } from '../habits/habit.service';
import { HabitService } from '../habits/habit.service';
import { Home } from './home';

describe('Home', () => {
  const renderHome = async (habits: Habit[] = []) => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        {
          provide: HabitService,
          useValue: { getHabits: () => of(habits) },
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
    expect(compiled.textContent).toContain('Leer 10 minutos');
    expect(compiled.textContent).toContain('Caminar');
  });
});
