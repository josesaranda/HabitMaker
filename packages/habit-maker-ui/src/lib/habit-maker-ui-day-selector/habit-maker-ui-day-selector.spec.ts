import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HabitMakerUIDaySelector } from './habit-maker-ui-day-selector';
import type { HabitMakerUIDaySelectorDay } from './habit-maker-ui-day-selector';

vi.mock('@hiseb/confetti', () => ({ default: vi.fn() }));

describe('HabitMakerUIDaySelector', () => {
  let fixture: ComponentFixture<HabitMakerUIDaySelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitMakerUIDaySelector],
    }).compileComponents();

    fixture = TestBed.createComponent(HabitMakerUIDaySelector);
    fixture.componentRef.setInput('days', [makeDay('2024-03-08', -1)]);
    fixture.componentRef.setInput('localeDays', [
      'M',
      'T',
      'W',
      'T',
      'F',
      'S',
      'S',
    ]);
  });

  it('announces day toggles with their date and inverse completion', () => {
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.dayToggled.subscribe((event) => emitted.push(event));

    fixture.nativeElement.querySelector('button')?.click();

    expect(emitted).toEqual([
      {
        date: '2024-03-08',
        completed: true,
      },
    ]);
  });

  it('emits navigation directions from the previous and next controls', () => {
    fixture.componentRef.setInput('days', [
      makeDay('2024-03-05', -12),
      makeDay('2024-03-06', -11),
      makeDay('2024-03-07', -10),
      makeDay('2024-03-08', -9),
      makeDay('2024-03-09', -8),
      makeDay('2024-03-10', -7),
      makeDay('2024-03-11', -6),
      makeDay('2024-03-12', -5),
      makeDay('2024-03-13', -4),
      makeDay('2024-03-14', -3),
      makeDay('2024-03-15', -2),
      makeDay('2024-03-16', -1),
      makeDay('2024-03-17', 0),
    ]);
    fixture.componentRef.setInput('showNavigation', true);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.navigation.subscribe((event) => emitted.push(event));

    fixture.nativeElement
      .querySelector<HTMLButtonElement>(
        'button[aria-label="Show previous days"]',
      )
      ?.click();
    fixture.nativeElement
      .querySelector<HTMLButtonElement>('button[aria-label="Show next days"]')
      ?.click();

    expect(emitted).toEqual([
      { direction: 'previous', days: 3 },
      { direction: 'next', days: 3 },
    ]);
  });
});

function makeDay(date: string, offset: number): HabitMakerUIDaySelectorDay {
  return {
    date,
    dayOfMonth: Number(date.slice(-2)),
    completed: false,
    offset,
    buffer: false,
    entering: false,
    disabled: false,
    ariaLabel: `Toggle ${date}`,
  };
}
