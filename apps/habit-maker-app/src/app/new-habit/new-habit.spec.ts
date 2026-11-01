import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewHabit } from './new-habit';

describe('NewHabit', () => {
  let fixture: ComponentFixture<NewHabit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewHabit],
    }).compileComponents();

    fixture = TestBed.createComponent(NewHabit);
    await fixture.whenStable();
  });

  it('renders the habit name field and start button', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(
      compiled.querySelector('label[for="new-habit-name"]')?.textContent,
    ).toBe('Tu hábito');
    expect(compiled.querySelector('input#new-habit-name')).not.toBeNull();
    expect(compiled.textContent).toContain('Comenzar hábito');
  });

  it('enables the start button only when the habit name has non-whitespace content', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const habitInput =
      compiled.querySelector<HTMLInputElement>('#new-habit-name')!;
    const startButton = compiled.querySelector<HTMLButtonElement>(
      '.new-habit__submit-button',
    )!;

    expect(startButton.disabled).toBe(true);

    habitInput.value = 'Leer 10 minutos';
    habitInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(startButton.disabled).toBe(false);

    habitInput.value = '   ';
    habitInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(startButton.disabled).toBe(true);
  });
});
