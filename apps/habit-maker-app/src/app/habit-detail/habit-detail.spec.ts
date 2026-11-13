import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { HabitMakerUIHeaderOutlet } from '@habit-maker/habit-maker-ui';
import confetti from '@hiseb/confetti';
import { of, throwError } from 'rxjs';
import { provideTranslocoTesting } from '../../../test-support/transloco-testing';
import { HabitService } from '../habits/habit.service';
import { HabitDetail } from './habit-detail';

vi.mock('@hiseb/confetti', () => ({ default: vi.fn() }));

@Component({
  imports: [HabitDetail, HabitMakerUIHeaderOutlet],
  template: `
    <habit-maker-ui-header-outlet />
    <app-habit-detail />
  `,
})
class HabitDetailWithHeaderOutletComponent {}

describe('HabitDetail', () => {
  it('shows the habit matching the route id', async () => {
    const paramMap = convertToParamMap({ id: 'habit-1' });
    const habitService = {
      getCompletionsForDates: () => of([]),
      getReminder: () => of({ enabled: false, time: null, timeZone: null }),
      getPushPublicKey: () => of({ publicKey: 'test-public-key' }),
      getTodayCompletion: () =>
        of({ date: '2026-11-01', completed: false, completedAt: null }),
    };
    await TestBed.configureTestingModule({
      imports: [HabitDetail],
      providers: [
        provideTranslocoTesting(),
        provideRouter([]),
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
            queryParamMap: of(convertToParamMap({})),
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
    expect(habitCard?.querySelector('article h2')?.textContent?.trim()).toBe(
      'Leer 10 minutos',
    );
    expect(habitCard?.querySelector('time')?.textContent).toContain(
      '1 nov 2026',
    );
    const pageContent = fixture.nativeElement.querySelector('main > div');
    expect(pageContent?.classList.contains('max-w-6xl')).toBe(true);
    expect(
      pageContent?.querySelector(':scope > habit-maker-ui-header'),
    ).not.toBeNull();
    expect(habitCard?.querySelector('a')).toBeNull();
    expect(
      habitCard?.querySelectorAll(
        'button[aria-label^="Mostrar los tres días"]',
      ),
    ).toHaveLength(2);
    expect(habitCard?.classList.contains('max-w-3xl')).toBe(true);
    const habitArticle = habitCard?.querySelector('article');
    expect(habitArticle?.classList.contains('hm-card')).toBe(true);
    expect(habitArticle?.classList.contains('max-w-md')).toBe(false);
    expect(habitArticle?.getAttribute('style')).toBeNull();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector<HTMLInputElement>('#habit-reminder-time')
        ?.disabled,
    ).toBe(true);
    expect(
      compiled.querySelector(
        'section[aria-labelledby="habit-completion-title"] button',
      ),
    ).toBeNull();
    expect(
      compiled.querySelector('habit-maker-ui-modal button[hmButton="primary"]'),
    ).not.toBeNull();
    expect(
      compiled.querySelector('#habit-completion-help')?.textContent?.trim(),
    ).toBe(
      'Pulsa el día de hoy en la tarjeta del hábito para marcarlo como completado.',
    );
  });

  it('hides the reminder settings when the server has no VAPID keys', async () => {
    await TestBed.configureTestingModule({
      imports: [HabitDetail],
      providers: [
        provideTranslocoTesting(),
        provideRouter([]),
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
            queryParamMap: of(convertToParamMap({})),
            snapshot: { paramMap: convertToParamMap({ id: 'habit-1' }) },
          },
        },
        {
          provide: HabitService,
          useValue: {
            getCompletionsForDates: () => of([]),
            getReminder: () =>
              of({ enabled: false, time: null, timeZone: null }),
            getPushPublicKey: () => of({ publicKey: null }),
            getTodayCompletion: () =>
              of({ date: toLocalDate(new Date()), completed: false }),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HabitDetail);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector(
        '#habit-reminder-title',
      ),
    ).toBeNull();
  });

  it('applies a changed reminder time only after saving it explicitly', async () => {
    const habitService = {
      getCompletionsForDates: () => of([]),
      getReminder: () =>
        of({ enabled: true, time: '08:00', timeZone: 'Europe/Madrid' }),
      getPushPublicKey: () => of({ publicKey: 'test-public-key' }),
      getTodayCompletion: () =>
        of({ date: '2026-11-01', completed: false, completedAt: null }),
      saveReminder: vi.fn(() =>
        of({ enabled: true, time: '09:30', timeZone: 'Europe/Madrid' }),
      ),
    };
    await TestBed.configureTestingModule({
      imports: [HabitDetail],
      providers: [
        provideTranslocoTesting(),
        provideRouter([]),
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
            queryParamMap: of(convertToParamMap({})),
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
    const timeInput = compiled.querySelector<HTMLInputElement>(
      '#habit-reminder-time',
    )!;
    expect(timeInput.disabled).toBe(false);
    timeInput.value = '09:30';
    timeInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(habitService.saveReminder).not.toHaveBeenCalled();
    const saveButton = compiled.querySelector<HTMLButtonElement>(
      'section[aria-labelledby="habit-reminder-title"] button',
    )!;
    expect(saveButton.disabled).toBe(false);
    saveButton.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(habitService.saveReminder).toHaveBeenCalledWith('habit-1', {
      enabled: true,
      time: '09:30',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    });
    expect(saveButton.disabled).toBe(true);
  });

  it('asks for confirmation before deleting and returns to home on success', async () => {
    const habitService = {
      getCompletionsForDates: () => of([]),
      getReminder: () => of({ enabled: false, time: null, timeZone: null }),
      getPushPublicKey: () => of({ publicKey: null }),
      getTodayCompletion: () =>
        of({ date: '2026-11-01', completed: false, completedAt: null }),
      deleteHabit: vi.fn(() => of(void 0)),
    };
    await TestBed.configureTestingModule({
      imports: [HabitDetail],
      providers: [
        provideTranslocoTesting(),
        provideRouter([]),
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
            queryParamMap: of(convertToParamMap({})),
            snapshot: { paramMap: convertToParamMap({ id: 'habit-1' }) },
          },
        },
        { provide: HabitService, useValue: habitService },
      ],
    }).compileComponents();

    const navigate = vi
      .spyOn(TestBed.inject(Router), 'navigate')
      .mockResolvedValue(true);
    const fixture = TestBed.createComponent(HabitDetail);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const deleteButton = compiled.querySelector<HTMLButtonElement>(
      'section[aria-labelledby="delete-habit-title"] button',
    )!;
    deleteButton.click();
    fixture.detectChanges();

    const dialog = compiled.querySelector<HTMLDialogElement>(
      'habit-maker-ui-modal dialog',
    )!;
    expect(dialog.open).toBe(true);
    expect(dialog.textContent).toContain(
      '¿Seguro que quieres eliminar «Leer 10 minutos»? Esta acción no se puede deshacer.',
    );
    expect(habitService.deleteHabit).not.toHaveBeenCalled();

    dialog
      .querySelector<HTMLButtonElement>('button[hmButton="primary"]')!
      .click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(habitService.deleteHabit).toHaveBeenCalledWith('habit-1');
    expect(navigate).toHaveBeenCalledWith(['/home']);
  });

  it('renames the habit from the header edit dialog', async () => {
    const habitService = {
      getCompletionsForDates: () => of([]),
      getReminder: () => of({ enabled: false, time: null, timeZone: null }),
      getPushPublicKey: () => of({ publicKey: null }),
      getTodayCompletion: () =>
        of({ date: '2026-11-01', completed: false, completedAt: null }),
      updateHabit: vi.fn(() =>
        of({
          id: 'habit-1',
          name: 'Leer 20 minutos',
          createdAt: '2026-11-01T00:00:00.000Z',
          updatedAt: '2026-11-02T00:00:00.000Z',
        }),
      ),
    };
    await TestBed.configureTestingModule({
      imports: [HabitDetailWithHeaderOutletComponent],
      providers: [
        provideTranslocoTesting(),
        provideRouter([]),
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
            queryParamMap: of(convertToParamMap({})),
            snapshot: { paramMap: convertToParamMap({ id: 'habit-1' }) },
          },
        },
        { provide: HabitService, useValue: habitService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(
      HabitDetailWithHeaderOutletComponent,
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const editButton = compiled.querySelector<HTMLButtonElement>(
      'habit-maker-ui-header-outlet button[hmButtonIcon]',
    )!;
    expect(editButton.getAttribute('aria-label')).toBe('Editar hábito');
    editButton.click();
    fixture.detectChanges();

    const nameInput =
      compiled.querySelector<HTMLInputElement>('#edit-habit-name')!;
    const editDialog = nameInput.closest<HTMLDialogElement>('dialog')!;
    expect(editDialog.open).toBe(true);
    expect(nameInput.value).toBe('Leer 10 minutos');

    nameInput.value = 'Leer 20 minutos';
    nameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    editDialog
      .querySelector<HTMLButtonElement>('button[hmButton="primary"]')!
      .click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(habitService.updateHabit).toHaveBeenCalledWith(
      'habit-1',
      'Leer 20 minutos',
    );
    expect(editDialog.open).toBe(false);
    expect(
      compiled.querySelector('app-habit-card article h2')?.textContent?.trim(),
    ).toBe('Leer 20 minutos');
  });

  it('keeps the edit dialog open and reports the error when the rename fails', async () => {
    const habitService = {
      getCompletionsForDates: () => of([]),
      getReminder: () => of({ enabled: false, time: null, timeZone: null }),
      getPushPublicKey: () => of({ publicKey: null }),
      getTodayCompletion: () =>
        of({ date: '2026-11-01', completed: false, completedAt: null }),
      updateHabit: vi.fn(() => throwError(() => new Error('boom'))),
    };
    await TestBed.configureTestingModule({
      imports: [HabitDetailWithHeaderOutletComponent],
      providers: [
        provideTranslocoTesting(),
        provideRouter([]),
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
            queryParamMap: of(convertToParamMap({})),
            snapshot: { paramMap: convertToParamMap({ id: 'habit-1' }) },
          },
        },
        { provide: HabitService, useValue: habitService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(
      HabitDetailWithHeaderOutletComponent,
    );
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled
      .querySelector<HTMLButtonElement>(
        'habit-maker-ui-header-outlet button[hmButtonIcon]',
      )!
      .click();
    fixture.detectChanges();

    const nameInput =
      compiled.querySelector<HTMLInputElement>('#edit-habit-name')!;
    const editDialog = nameInput.closest<HTMLDialogElement>('dialog')!;
    nameInput.value = 'Leer 20 minutos';
    nameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    editDialog
      .querySelector<HTMLButtonElement>('button[hmButton="primary"]')!
      .click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(editDialog.open).toBe(true);
    expect(editDialog.textContent).toContain(
      'No se pudo actualizar el hábito. Inténtalo de nuevo.',
    );
    expect(
      compiled.querySelector('app-habit-card article h2')?.textContent?.trim(),
    ).toBe('Leer 10 minutos');
  });

  it('restores the calendar window from the URL and updates it on navigation', async () => {
    const initialStart = new Date();
    initialStart.setHours(0, 0, 0, 0);
    initialStart.setDate(initialStart.getDate() - 12);
    const initialStartDate = toLocalDate(initialStart);
    const nextStart = new Date(initialStart);
    nextStart.setDate(nextStart.getDate() + 3);
    const nextStartDate = toLocalDate(nextStart);
    await TestBed.configureTestingModule({
      imports: [HabitDetail],
      providers: [
        provideTranslocoTesting(),
        provideRouter([]),
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
            queryParamMap: of(convertToParamMap({ from: initialStartDate })),
            snapshot: { paramMap: convertToParamMap({ id: 'habit-1' }) },
          },
        },
        {
          provide: HabitService,
          useValue: {
            getCompletionsForDates: () => of([]),
            getReminder: () =>
              of({ enabled: false, time: null, timeZone: null }),
            getPushPublicKey: () => of({ publicKey: null }),
            getTodayCompletion: () =>
              of({ date: toLocalDate(new Date()), completed: false }),
          },
        },
      ],
    }).compileComponents();

    const navigate = vi
      .spyOn(TestBed.inject(Router), 'navigate')
      .mockResolvedValue(true);
    const fixture = TestBed.createComponent(HabitDetail);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector(
        `[aria-label="Marcar como completado el ${formatSpanishDate(initialStartDate)}"]`,
      ),
    ).not.toBeNull();

    compiled
      .querySelector<HTMLButtonElement>(
        '[aria-label="Mostrar los tres días siguientes"]',
      )!
      .click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { from: nextStartDate },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      }),
    );
    expect(
      compiled.querySelector(
        `[aria-label="Marcar como completado el ${formatSpanishDate(nextStartDate)}"]`,
      ),
    ).not.toBeNull();
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
      getReminder: () => of({ enabled: false, time: null, timeZone: null }),
      getPushPublicKey: () => of({ publicKey: null }),
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
        provideTranslocoTesting(),
        provideRouter([]),
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
            queryParamMap: of(convertToParamMap({})),
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
      `[aria-label="Marcar como completado el ${formatSpanishDate(today)}"]`,
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
      `[aria-label="Marcar como completado el ${formatSpanishDate(previousDateLabel)}"]`,
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

function formatSpanishDate(date: string): string {
  return new Intl.DateTimeFormat('es-ES', { dateStyle: 'full' }).format(
    new Date(`${date}T00:00:00`),
  );
}
