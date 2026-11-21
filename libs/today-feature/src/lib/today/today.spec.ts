import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EMPTY, Observable, Subject, map, of, throwError } from 'rxjs';
import { provideTranslocoTesting } from '@habit-maker/test-support';
import { Habit } from '@habit-maker/habits-data-access';
import { HabitService } from '@habit-maker/habits-data-access';
import { Today } from './today';

vi.mock('@hiseb/confetti', () => ({ default: vi.fn() }));

const activeHabit: Habit = {
  id: 'habit-1',
  name: 'Leer 10 minutos',
  emoji: '📚',
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
};

const secondHabit: Habit = {
  id: 'habit-3',
  name: 'Meditar',
  emoji: '🧘',
  createdAt: '2026-11-02T00:00:00.000Z',
  updatedAt: '2026-11-02T00:00:00.000Z',
};

const archivedHabit: Habit = {
  id: 'habit-2',
  name: 'Caminar',
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  archivedAt: '2026-11-10T00:00:00.000Z',
};

describe('Today', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  const renderToday = async ({
    habits = [activeHabit],
    archivedCount = 0,
    completed = false,
    habitsRequest,
    setCompletionRequest,
  }: {
    habits?: Habit[];
    archivedCount?: number;
    completed?: boolean;
    habitsRequest?: Observable<Habit[]>;
    setCompletionRequest?: Observable<{
      date: string;
      completed: boolean;
      completedAt: string | null;
      currentStreak: number;
    }>;
  } = {}) => {
    const habitService = {
      getHabits: vi.fn(
        ({ includeArchived = false }: { includeArchived?: boolean } = {}) =>
          habitsRequest ??
          of(
            includeArchived
              ? habits
              : habits.filter((habit) => !habit.archivedAt),
          ),
      ),
      getHabitsWithTodayCompletions: vi.fn(
        ({ includeArchived = false }: { includeArchived?: boolean } = {}) =>
          (
            habitsRequest ??
            of(
              includeArchived
                ? habits
                : habits.filter((habit) => !habit.archivedAt),
            )
          ).pipe(
            map((list: Habit[]) => ({
              habits: list,
              completions: Object.fromEntries(
                list.map((habit) => [habit.id, completed]),
              ),
            })),
          ),
      ),
      getArchivedCount: vi.fn(() => of({ count: archivedCount })),
      getTodayCompletion: vi.fn((_id: string) =>
        of({
          date: '2026-11-19',
          completed,
          completedAt: completed ? '2026-11-19T08:00:00.000Z' : null,
        }),
      ),
      getTodayCompletions: vi.fn((ids: string[]) =>
        of(Object.fromEntries(ids.map((id) => [id, completed]))),
      ),
      setCompletion: vi.fn(
        (_id: string, date: string, value: boolean) =>
          setCompletionRequest ??
          of({
            date,
            completed: value,
            completedAt: value ? '2026-11-19T08:00:00.000Z' : null,
            currentStreak: value ? 3 : 0,
          }),
      ),
      habitCreated$: EMPTY,
    };

    await TestBed.configureTestingModule({
      imports: [Today],
      providers: [
        provideTranslocoTesting(),
        provideRouter([]),
        { provide: HabitService, useValue: habitService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Today);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, habitService };
  };

  it('renders a compact card for each habit with its completion state', async () => {
    const { fixture } = await renderToday();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('hm-card-compact')).toHaveLength(1);
    expect(
      compiled.querySelector('hm-card-compact .hm-card-compact__name')
        ?.textContent,
    ).toContain('Leer 10 minutos');
    expect(
      compiled.querySelector('hm-card-compact .hm-card-compact__emoji-value')
        ?.textContent,
    ).toBe('📚');
    expect(compiled.querySelector('[data-testid="today-empty"]')).toBeNull();
  });

  it('renders the habit completion for today', async () => {
    const { fixture } = await renderToday({ completed: true });

    expect(
      fixture.nativeElement.querySelector(
        'hm-card-compact.hm-card-compact--selected',
      ),
    ).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector(
        'hm-card-compact button[aria-pressed="true"]',
      ),
    ).not.toBeNull();
  });

  it('marks a habit as completed for today', async () => {
    const { fixture, habitService } = await renderToday();
    const compiled = fixture.nativeElement as HTMLElement;
    const toggle = compiled.querySelector<HTMLButtonElement>(
      'hm-card-compact button',
    );

    expect(toggle?.getAttribute('aria-pressed')).toBe('false');
    toggle?.click();
    fixture.detectChanges();

    expect(habitService.setCompletion).toHaveBeenCalledWith(
      'habit-1',
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      true,
    );
    expect(
      compiled.querySelector('hm-card-compact.hm-card-compact--selected'),
    ).not.toBeNull();
  });

  it('lists archived habits with a disabled toggle when they are shown', async () => {
    sessionStorage.setItem('habitmaker.home.showArchived', 'true');
    const { fixture } = await renderToday({
      habits: [activeHabit, archivedHabit],
      archivedCount: 1,
    });
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelectorAll('hm-card-compact')).toHaveLength(2);
    expect(
      compiled.querySelector('#today-archived-title')?.textContent,
    ).toContain('Hábitos archivados');
    expect(compiled.textContent).toContain('Caminar');
    expect(
      compiled
        .querySelector('#today-archived-title + div hm-card-compact button')
        ?.hasAttribute('disabled'),
    ).toBe(true);
  });

  it('shows an empty state with the add habit action when there are no habits', async () => {
    const { fixture } = await renderToday({ habits: [] });
    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('[data-testid="today-empty"]'),
    ).not.toBeNull();
    expect(compiled.querySelector('hm-card-compact')).toBeNull();
  });

  it('keeps habit buttons enabled while a save is in flight', async () => {
    const completion$ = new Subject<{
      date: string;
      completed: boolean;
      completedAt: string | null;
      currentStreak: number;
    }>();
    const { fixture } = await renderToday({
      habits: [activeHabit, secondHabit],
      setCompletionRequest: completion$.asObservable(),
    });
    const compiled = fixture.nativeElement as HTMLElement;
    const toggles = compiled.querySelectorAll<HTMLButtonElement>(
      'hm-card-compact button',
    );

    toggles[0].click();
    fixture.detectChanges();

    expect(toggles[0].disabled).toBe(false);
    expect(toggles[1].disabled).toBe(false);

    completion$.next({
      date: '2026-11-19',
      completed: true,
      completedAt: '2026-11-19T08:00:00.000Z',
      currentStreak: 1,
    });
    completion$.complete();
    fixture.detectChanges();

    expect(toggles[0].disabled).toBe(false);
  });

  it('does not show the empty state until habits finish loading', async () => {
    const habits$ = new Subject<Habit[]>();
    const { fixture } = await renderToday({
      habitsRequest: habits$.asObservable(),
    });
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('[data-testid="today-empty"]')).toBeNull();

    habits$.next([]);
    habits$.complete();
    fixture.detectChanges();

    expect(
      compiled.querySelector('[data-testid="today-empty"]'),
    ).not.toBeNull();
  });

  it('renders habits with a staggered entrance delay', async () => {
    const { fixture } = await renderToday({
      habits: [activeHabit, secondHabit],
    });
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll<HTMLElement>('hm-card-compact');

    expect(cards[0].style.animationDelay).toBe('0ms');
    expect(cards[1].style.animationDelay).toBe('50ms');
  });

  it('does not show the empty state when loading habits fails', async () => {
    const { fixture } = await renderToday({
      habitsRequest: throwError(() => new Error('load failed')),
    });
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('[data-testid="today-empty"]')).toBeNull();
  });
});
