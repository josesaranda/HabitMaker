import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { HabitService } from '../habits/habit.service';
import { HabitDetail } from './habit-detail';

describe('HabitDetail', () => {
  it('shows the habit matching the route id', async () => {
    const paramMap = convertToParamMap({ id: 'habit-1' });
    await TestBed.configureTestingModule({
      imports: [HabitDetail],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(paramMap), snapshot: { paramMap } },
        },
        {
          provide: HabitService,
          useValue: {
            getHabit: () =>
              of({
                id: 'habit-1',
                name: 'Leer 10 minutos',
                createdAt: '2026-11-01T00:00:00.000Z',
                updatedAt: '2026-11-01T00:00:00.000Z',
              }),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HabitDetail);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain(
      'Leer 10 minutos',
    );
    expect(fixture.nativeElement.querySelector('time')?.textContent).toContain(
      '1 de noviembre de 2026',
    );
    const compiled = fixture.nativeElement as HTMLElement;
    const completionButton = compiled.querySelector<HTMLButtonElement>(
      'button[hmButton="primary"]',
    );
    expect(completionButton?.textContent?.trim()).toBe('Marcar como completado');
    expect(
      completionButton?.closest('section[aria-labelledby="habit-completion-title"]'),
    ).not.toBeNull();
    expect(completionButton?.getAttribute('aria-describedby')).toBe(
      'habit-completion-help',
    );
    expect(
      compiled.querySelector('#habit-completion-help')?.textContent?.trim(),
    ).toBe('Pulsa el botón cuando hayas completado este hábito hoy.');

    completionButton?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('[role="status"]')?.textContent?.trim()).toBe(
      '¡Enhorabuena, ya has completado tu hábito hoy!',
    );
    expect(compiled.querySelector('#habit-completion-title')).toBeNull();
    expect(compiled.querySelector('#habit-completion-help')).toBeNull();
    expect(completionButton?.disabled).toBe(true);
    expect(completionButton?.textContent?.trim()).toBe('¡Completado hoy!');
    expect(completionButton?.hasAttribute('aria-describedby')).toBe(false);
  });
});
