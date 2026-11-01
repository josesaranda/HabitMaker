import { TestBed } from '@angular/core/testing';
import { Home } from './home';

describe('Home', () => {
  it('opens the first-habit modal from the welcome call to action', async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
    }).compileComponents();
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const dialog = compiled.querySelector<HTMLDialogElement>('dialog')!;
    Object.defineProperty(dialog, 'showModal', {
      configurable: true,
      value: () => dialog.setAttribute('open', ''),
    });

    compiled
      .querySelector<HTMLButtonElement>('.home-card__add-habit-button')!
      .click();

    expect(dialog.open).toBe(true);
    expect(dialog.getAttribute('aria-label')).toBe(
      '¿Qué hábito quieres crear?',
    );
    expect(dialog.querySelector('app-new-habit')).not.toBeNull();
    expect(
      dialog.querySelector('label[for="new-habit-name"]')?.textContent,
    ).toBe('Tu hábito');
    expect(dialog.querySelector('input#new-habit-name')).not.toBeNull();
    expect(dialog.textContent).toContain('Comenzar hábito');
  });
});
