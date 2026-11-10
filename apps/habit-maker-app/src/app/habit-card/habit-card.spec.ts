import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { provideTranslocoTesting } from '../../../test-support/transloco-testing';
import { HabitService } from '../habits/habit.service';
import { HabitCard } from './habit-card';

describe('HabitCard', () => {
  let component: HabitCard;
  let fixture: ComponentFixture<HabitCard>;
  let requestedDates: string[][];
  let completedDates: Set<string>;

  beforeEach(async () => {
    requestedDates = [];
    completedDates = new Set();
    await TestBed.configureTestingModule({
      imports: [HabitCard],
      providers: [
        provideTranslocoTesting(),
        provideRouter([]),
        {
          provide: HabitService,
          useValue: {
            getCompletionsForDates: (_id: string, dates: string[]) => {
              requestedDates.push(dates);
              return of(
                dates.map((date) => ({
                  date,
                  completed: completedDates.has(date),
                  completedAt: null,
                })),
              );
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HabitCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'habit-1');
  });

  it('renders a seven-day window with a three-day virtual buffer', async () => {
    fixture.componentRef.setInput('name', 'Un poco de lectura');
    fixture.componentRef.setInput('startedAt', '2023-10-01');
    const previousDate = new Date();
    previousDate.setHours(0, 0, 0, 0);
    previousDate.setDate(previousDate.getDate() - 3);
    completedDates.add(toLocalDate(previousDate));
    completedDates.add(toLocalDate(new Date()));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('strong')?.textContent).toBe(
      'Un poco de lectura',
    );
    expect(compiled.querySelector('a')).toBeNull();
    expect(
      compiled.querySelector('[aria-label^="Marcar como completado"]'),
    ).toBeNull();
    expect(
      compiled.querySelector('[aria-label="Mostrar los tres días anteriores"]'),
    ).toBeNull();
    expect(
      compiled.querySelector('[aria-label="Mostrar los tres días siguientes"]'),
    ).toBeNull();
    expect(compiled.querySelector('strong')?.getAttribute('style')).toBeNull();
    expect(compiled.querySelector('article')?.getAttribute('style')).toBeNull();
    expect(compiled.querySelector('time')?.getAttribute('datetime')).toBe(
      '2023-10-01',
    );
    expect(compiled.querySelector('time')?.textContent).toContain('1 oct 2023');
    const dayItems = compiled.querySelectorAll(
      '.habit-card__days-track > *',
    );
    expect(dayItems).toHaveLength(13);
    const visibleDays = Array.from(dayItems).slice(3, 10);

    const weekdayLabels = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    const today = new Date().getDay();
    expect(
      visibleDays.map((item) => item.querySelector('span')?.textContent),
    ).toEqual(
      Array.from(
        { length: 7 },
        (_, index) => weekdayLabels[(today + index - 6 + 7) % 7],
      ),
    );
    expect(requestedDates).toHaveLength(1);
    expect(requestedDates[0]).toHaveLength(13);
    expect(requestedDates[0]).toContain(toLocalDate(new Date()));
    expect(dayItems[6].querySelector('b')?.textContent).toBe('✓');
    expect(dayItems[7].querySelector('b')?.textContent).toBe('');
    expect(dayItems[9].querySelector('b')?.textContent).toBe('✓');
    expect(dayItems[6].querySelector('b')?.classList.contains('border-accent')).toBe(
      false,
    );
    expect(dayItems[9].querySelector('b')?.classList.contains('border-accent')).toBe(
      true,
    );
    expect(dayItems[9].querySelectorAll('span')[1]?.textContent).toBe(
      String(new Date().getDate()),
    );
  });

  it('renders preview completion offsets without loading persisted data', async () => {
    fixture.componentRef.setInput('name', 'Example habit');
    fixture.componentRef.setInput('startedAt', '2023-10-01');
    fixture.componentRef.setInput('previewCompletedDayOffsets', [-5, -3, -1]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const dayItems = fixture.nativeElement.querySelectorAll(
      '.habit-card__days-track > *',
    );

    expect(dayItems[4].querySelector('b')?.textContent).toBe('✓');
    expect(dayItems[6].querySelector('b')?.textContent).toBe('✓');
    expect(dayItems[8].querySelector('b')?.textContent).toBe('✓');
    expect(dayItems[9].querySelector('b')?.textContent).toBe('');
    expect(requestedDates).toHaveLength(0);
  });

  it('snaps gestures to individual days and limits future navigation', async () => {
    fixture.componentRef.setInput('name', 'Un poco de lectura');
    fixture.componentRef.setInput('startedAt', '2023-10-01');
    fixture.componentRef.setInput('showDayNavigation', true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const nextButton = compiled.querySelector<HTMLButtonElement>(
      '[aria-label="Mostrar los tres días siguientes"]',
    )!;
    component.windowStartDateChange.subscribe((windowStartDate) =>
      fixture.componentRef.setInput('windowStartDate', windowStartDate),
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maximumFutureDate = new Date(today);
    maximumFutureDate.setDate(maximumFutureDate.getDate() + 3);

    const initialDays = compiled.querySelectorAll(
      '.habit-card__days-track > *',
    );
    expect(initialDays).toHaveLength(13);
    expect(initialDays[9].querySelectorAll('span')[1]?.textContent).toBe(
      String(today.getDate()),
    );
    expect(requestedDates.at(-1)?.[12]).toBe(toLocalDate(maximumFutureDate));
    expect(nextButton.disabled).toBe(true);

    const datesAtFutureLimit = requestedDates.length;
    nextButton.click();
    fixture.detectChanges();
    expect(requestedDates).toHaveLength(datesAtFutureLimit);

    const daysGrid = compiled.querySelector<HTMLElement>(
      'article [aria-hidden="true"]',
    )!;
    vi.spyOn(daysGrid, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(0, 0, 280, 40),
    );
    const swipeable = component as unknown as SwipeableHabitCard;
    const emittedStarts: string[] = [];
    component.windowStartDateChange.subscribe((date) => emittedStarts.push(date));

    swipeable.startDaySwipe(pointerEvent(80, daysGrid));
    swipeable.moveDaySwipe(pointerEvent(105, daysGrid));
    expect(swipeable.dragOffset()).toBe(25);
    expect(emittedStarts).toHaveLength(0);
    swipeable.finishDaySwipe(pointerEvent(105, daysGrid));
    expect(swipeable.dragOffset()).toBe(40);
    expect(emittedStarts).toHaveLength(0);
    swipeable.completeDaySnap({ propertyName: 'transform' } as TransitionEvent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const daysAfterPreviousMove = compiled.querySelectorAll(
      '.habit-card__days-track > *',
    );
    expect(daysAfterPreviousMove).toHaveLength(13);
    expect(requestedDates.at(-1)).toHaveLength(13);
    const previousWindowStart = new Date(today);
    previousWindowStart.setDate(previousWindowStart.getDate() - 7);
    expect(emittedStarts[0]).toBe(toLocalDate(previousWindowStart));
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    expect(requestedDates.at(-1)?.[9]).toBe(toLocalDate(yesterday));
    expect(emittedStarts).toHaveLength(1);
    expect(nextButton.disabled).toBe(false);

    swipeable.startDaySwipe(pointerEvent(160, daysGrid));
    swipeable.moveDaySwipe(pointerEvent(135, daysGrid));
    expect(swipeable.dragOffset()).toBe(-25);
    swipeable.finishDaySwipe(pointerEvent(135, daysGrid));
    expect(swipeable.dragOffset()).toBe(-40);
    swipeable.completeDaySnap({ propertyName: 'transform' } as TransitionEvent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(nextButton.disabled).toBe(true);
    expect(requestedDates).toHaveLength(datesAtFutureLimit + 2);
    expect(requestedDates.at(-1)?.[12]).toBe(toLocalDate(maximumFutureDate));
    expect(emittedStarts).toHaveLength(2);
    const latestWindowStart = new Date(today);
    latestWindowStart.setDate(latestWindowStart.getDate() - 6);
    expect(emittedStarts[1]).toBe(toLocalDate(latestWindowStart));
    expect(
      compiled.querySelectorAll('.habit-card__days-track > *'),
    ).toHaveLength(13);
  });

  it('emits the selected date with the inverse completion state when enabled', async () => {
    fixture.componentRef.setInput('name', 'Un poco de lectura');
    fixture.componentRef.setInput('startedAt', '2023-10-01');
    fixture.componentRef.setInput('dayToggleEnabled', true);
    fixture.componentRef.setInput('showDayNavigation', true);
    const completedDate = new Date();
    completedDate.setHours(0, 0, 0, 0);
    completedDate.setDate(completedDate.getDate() - 3);
    const date = toLocalDate(completedDate);
    const futureDate = new Date();
    futureDate.setHours(0, 0, 0, 0);
    futureDate.setDate(futureDate.getDate() + 3);
    const futureDateLabel = toLocalDate(futureDate);
    completedDates.add(date);
    const emitted: {
      date: string;
      completed: boolean;
      position: { x: number; y: number };
    }[] = [];
    component.dayToggled.subscribe((event) => emitted.push(event));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const dayButton = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLButtonElement>(
      `[aria-label="Desmarcar como completado el ${formatSpanishDate(date)}"]`,
    );
    expect(dayButton?.getAttribute('aria-pressed')).toBe('true');
    const daysViewport = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLElement>('.habit-card__days-viewport')!;
    vi.spyOn(daysViewport, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(0, 0, 280, 40),
    );
    const tapEvent = pointerEvent(100, daysViewport);
    const swipeable = component as unknown as SwipeableHabitCard;
    swipeable.startDaySwipe(tapEvent);
    swipeable.finishDaySwipe(tapEvent);
    expect(tapEvent.preventDefault).not.toHaveBeenCalled();

    const emittedWindowStarts: string[] = [];
    component.windowStartDateChange.subscribe((windowStart) =>
      emittedWindowStarts.push(windowStart),
    );
    swipeable.startDaySwipe(pointerEvent(100, daysViewport, 100, 'touch'));
    swipeable.moveDaySwipe(pointerEvent(105, daysViewport, 120, 'touch'));
    expect(swipeable.isDragging()).toBe(false);
    expect(emittedWindowStarts).toHaveLength(0);

    vi.spyOn(dayButton!, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(10, 20, 30, 40),
    );
    dayButton?.click();

    expect(emitted).toEqual([
      { date, completed: false, position: { x: 25, y: 40 } },
    ]);
    const futureDayButton = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLButtonElement>(
      `[aria-label="No se puede completar el día ${formatSpanishDate(futureDateLabel)}"]`,
    );
    expect(futureDayButton?.disabled).toBe(true);
    futureDayButton?.click();
    expect(emitted).toEqual([
      { date, completed: false, position: { x: 25, y: 40 } },
    ]);
  });

  it('shows the provided date if it is not valid', async () => {
    fixture.componentRef.setInput('name', 'Leer');
    fixture.componentRef.setInput('startedAt', 'fecha desconocida');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('time')?.textContent).toContain(
      'fecha desconocida',
    );
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

interface SwipeableHabitCard {
  readonly dragOffset: () => number;
  readonly isDragging: () => boolean;
  startDaySwipe(event: PointerEvent): void;
  moveDaySwipe(event: PointerEvent): void;
  finishDaySwipe(event: PointerEvent): void;
  completeDaySnap(event: TransitionEvent): void;
}

function pointerEvent(
  clientX: number,
  currentTarget: HTMLElement,
  clientY = 0,
  pointerType = 'mouse',
): PointerEvent {
  return {
    isPrimary: true,
    pointerType,
    button: 0,
    clientX,
    clientY,
    pointerId: -1,
    currentTarget,
    preventDefault: vi.fn(),
  } as unknown as PointerEvent;
}
