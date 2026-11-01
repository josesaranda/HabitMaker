import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HabitCard } from './habit-card';

describe('HabitCard', () => {
  let component: HabitCard;
  let fixture: ComponentFixture<HabitCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitCard],
    }).compileComponents();

    fixture = TestBed.createComponent(HabitCard);
    component = fixture.componentInstance;
  });

  it('renders the habit name and formatted start date', () => {
    fixture.componentRef.setInput('name', 'Un poco de lectura');
    fixture.componentRef.setInput('startedAt', '2023-10-01');
    fixture.detectChanges();

    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('strong')?.textContent).toBe(
      'Un poco de lectura',
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
    expect(dayItems[3].querySelector('b')?.textContent).toBe('·');
  });

  it('shows the provided date if it is not valid', () => {
    fixture.componentRef.setInput('name', 'Leer');
    fixture.componentRef.setInput('startedAt', 'fecha desconocida');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('time')?.textContent).toContain(
      'fecha desconocida',
    );
  });
});
