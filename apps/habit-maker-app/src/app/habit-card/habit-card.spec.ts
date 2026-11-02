import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
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

  it('renders completion data for only the seven displayed dates', async () => {
    fixture.componentRef.setInput('name', 'Un poco de lectura');
    fixture.componentRef.setInput('startedAt', '2023-10-01');
    const previousDate = new Date();
    previousDate.setHours(0, 0, 0, 0);
    previousDate.setDate(previousDate.getDate() - 3);
    completedDates.add(toLocalDate(previousDate));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('strong')?.textContent).toBe(
      'Un poco de lectura',
    );
    expect(compiled.querySelector('a')?.getAttribute('href')).toBe(
      '/habits/habit-1',
    );
    expect(compiled.querySelector('strong')?.getAttribute('style')).toContain(
      'view-transition-name: habit-title-habit-1',
    );
    expect(compiled.querySelector('article')?.getAttribute('style')).toContain(
      'view-transition-name: habit-container-habit-1',
    );
    expect(compiled.querySelector('time')?.getAttribute('datetime')).toBe(
      '2023-10-01',
    );
    expect(compiled.querySelector('time')?.textContent).toContain('1 oct 2023');
    const dayItems = compiled.querySelectorAll(
      'article > div[aria-hidden="true"] > div',
    );
    expect(dayItems).toHaveLength(7);

    const weekdayLabels = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    const today = new Date().getDay();
    expect(
      Array.from(dayItems, (item) => item.querySelector('span')?.textContent),
    ).toEqual(
      Array.from(
        { length: 7 },
        (_, index) => weekdayLabels[(today + index - 3 + 7) % 7],
      ),
    );
    expect(requestedDates).toHaveLength(1);
    expect(requestedDates[0]).toHaveLength(7);
    expect(requestedDates[0]).toContain(toLocalDate(new Date()));
    expect(dayItems[0].querySelector('b')?.textContent).toBe('✓');
    expect(dayItems[1].querySelector('b')?.textContent).toBe('');
    expect(dayItems[3].querySelector('b')?.textContent).toBe('');
    expect(dayItems[3].querySelectorAll('span')[1]?.textContent).toBe(
      String(new Date().getDate()),
    );
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
