import { ComponentFixture, TestBed } from '@angular/core/testing';
import confetti from '@hiseb/confetti';
import { HabitMakerUIButtonDay } from './habit-maker-ui-button-day';

vi.mock('@hiseb/confetti', () => ({ default: vi.fn() }));

describe('HabitMakerUIButtonDay', () => {
  let fixture: ComponentFixture<HabitMakerUIButtonDay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitMakerUIButtonDay],
    }).compileComponents();

    fixture = TestBed.createComponent(HabitMakerUIButtonDay);
    fixture.componentRef.setInput('weekday', 'M');
    fixture.componentRef.setInput('dayOfMonth', 13);
    fixture.componentRef.setInput('ariaLabel', 'Mark Monday, day 13 complete');
  });

  it('exposes its selected state and emits a user activation', () => {
    fixture.componentRef.setInput('selected', true);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const emittedEvents: MouseEvent[] = [];
    component.pressed.subscribe((event) => emittedEvents.push(event));

    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe(
      'Mark Monday, day 13 complete',
    );
    expect(button.getAttribute('aria-pressed')).toBe('true');
    button.click();

    expect(emittedEvents).toHaveLength(1);
    expect(emittedEvents[0].type).toBe('click');
    expect(confetti).not.toHaveBeenCalled();
  });

  it('celebrates a day when it is marked complete', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(10, 20, 30, 40),
    );

    button.click();

    expect(confetti).toHaveBeenCalledWith({
      position: { x: 25, y: 40 },
      color: ['#a8c5ad', '#e6b875', '#ffffff'],
    });
  });

  it('keeps disabled days unavailable to keyboard and pointer activation', () => {
    fixture.componentRef.setInput('state', 'disabled');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.classList.contains('hm-button-day--disabled')).toBe(true);
  });
});
