import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
} from '@angular/router';
import confetti from '@hiseb/confetti';
import { of } from 'rxjs';
import { HabitService } from '../habits/habit.service';
import { HabitDetail } from './habit-detail';

vi.mock('@hiseb/confetti', () => ({ default: vi.fn() }));

describe('HabitDetail', () => {
  it('shows the habit matching the route id', async () => {
    const paramMap = convertToParamMap({ id: 'habit-1' });
    const habitService = {
      getCompletionsForDates: () => of([]),
      getTodayCompletion: () =>
        of({ date: '2026-11-01', completed: false, completedAt: null }),
    };
    await TestBed.configureTestingModule({
      imports: [HabitDetail],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              habitResult: {
                habit: {
                  id: 'habit-1',
                  name: 'Leer 10 minutos',
                  createdAt: '2026-11-01T00:00:00.000Z',
                  updatedAt: '2026-11-01T00:00:00.000Z',
                },
                error: null,
              },
            }),
            snapshot: { paramMap },
          },
        },
        {
          provide: HabitService,
          useValue: habitService,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HabitDetail);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const habitCard = fixture.nativeElement.querySelector('app-habit-card');
    expect(
      habitCard?.querySelector('article strong')?.textContent?.trim(),
    ).toBe('Leer 10 minutos');
    expect(habitCard?.querySelector('time')?.textContent).toContain(
      'Desde 1 nov 2026',
    );
    const pageContent = fixture.nativeElement.querySelector('main > div');
    expect(pageContent?.classList.contains('max-w-6xl')).toBe(true);
    const header = pageContent?.querySelector(':scope > habit-maker-header');
    expect(header?.querySelector('h1')?.textContent?.trim()).toBe(
      'Detalle del hábito',
    );
    expect(header?.querySelector('a')?.getAttribute('href')).toBe('/home');
    expect(header?.nextElementSibling).toBe(habitCard);
    expect(habitCard?.querySelector('a')).toBeNull();
    expect(habitCard?.classList.contains('max-w-3xl')).toBe(true);
    const habitArticle = habitCard?.querySelector('article');
    expect(habitArticle?.classList.contains('w-full')).toBe(true);
    expect(habitArticle?.classList.contains('max-w-md')).toBe(false);
    expect(habitArticle?.getAttribute('style')).toBeNull();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector(
        'section[aria-labelledby="habit-completion-title"] button',
      ),
    ).toBeNull();
    expect(
      compiled.querySelector('button[hmButton="primary"]'),
    ).toBeNull();
    expect(
      compiled.querySelector('#habit-completion-help')?.textContent?.trim(),
    ).toBe(
      'Pulsa el día de hoy en la tarjeta del hábito para marcarlo como completado.',
    );
  });

  it('persists day toggles and updates the current-day completion state', async () => {
    const today = toLocalDate(new Date());
    const completedDates = new Set<string>();
    const habitService = {
      getCompletionsForDates: (_id: string, dates: string[]) =>
        of(
          dates.map((date) => ({
            date,
            completed: completedDates.has(date),
            completedAt: null,
          })),
        ),
      getTodayCompletion: () =>
        of({
          date: today,
          completed: completedDates.has(today),
          completedAt: null,
        }),
      setCompletion: vi.fn((_id: string, date: string, completed: boolean) => {
        if (completed) completedDates.add(date);
        else completedDates.delete(date);
        return of({ date, completed, completedAt: null });
      }),
    };

    await TestBed.configureTestingModule({
      imports: [HabitDetail],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              habitResult: {
                habit: {
                  id: 'habit-1',
                  name: 'Leer 10 minutos',
                  createdAt: '2026-11-01T00:00:00.000Z',
                  updatedAt: '2026-11-01T00:00:00.000Z',
                },
                error: null,
              },
            }),
            snapshot: { paramMap: convertToParamMap({ id: 'habit-1' }) },
          },
        },
        { provide: HabitService, useValue: habitService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HabitDetail);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const dayButton = compiled.querySelector<HTMLButtonElement>(
      `[aria-label="Marcar como completado el ${today}"]`,
    );
    expect(dayButton).not.toBeNull();
    vi.spyOn(dayButton!, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(40, 60, 40, 40),
    );
    dayButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(habitService.setCompletion).toHaveBeenCalledWith(
      'habit-1',
      today,
      true,
    );
    expect(dayButton?.getAttribute('aria-pressed')).toBe('true');
    expect(compiled.querySelector('[role="status"]')?.textContent).toContain(
      '¡Enhorabuena, ya has completado tu hábito hoy!',
    );
    expect(confetti).toHaveBeenCalledWith({
      position: { x: 60, y: 80 },
      color: ['#a8c5ad', '#e6b875', '#ffffff'],
    });

    const previousDate = new Date();
    previousDate.setDate(previousDate.getDate() - 1);
    const previousDateLabel = toLocalDate(previousDate);
    const previousDayButton = compiled.querySelector<HTMLButtonElement>(
      `[aria-label="Marcar como completado el ${previousDateLabel}"]`,
    );
    expect(previousDayButton).not.toBeNull();
    vi.spyOn(previousDayButton!, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(100, 120, 20, 20),
    );
    previousDayButton?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(habitService.setCompletion).toHaveBeenLastCalledWith(
      'habit-1',
      previousDateLabel,
      true,
    );
    expect(confetti).toHaveBeenLastCalledWith({
      position: { x: 110, y: 130 },
      color: ['#a8c5ad', '#e6b875', '#ffffff'],
    });
  });
});

function toLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
