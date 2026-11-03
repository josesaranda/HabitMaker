import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HabitMakerUIModal } from './habit-maker-ui-modal';

@Component({
  imports: [HabitMakerUIModal],
  template: `
    <button
      #trigger
      class="test-trigger"
      type="button"
      (click)="modal.openFrom(trigger)"
    >
      Abrir modal
    </button>
    <habit-maker-ui-modal #modal label="Crear hábito">
      <h2>Crear hábito</h2>
      <input autofocus />
      <p>El contenido se proyecta dentro del modal.</p>
    </habit-maker-ui-modal>
  `,
})
class ModalHost {}

function mockNativeDialog(dialog: HTMLDialogElement): void {
  Object.defineProperty(dialog, 'showModal', {
    configurable: true,
    value: () => dialog.setAttribute('open', ''),
  });
  Object.defineProperty(dialog, 'close', {
    configurable: true,
    value: () => dialog.removeAttribute('open'),
  });
}

describe('HabitMakerUIModal', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalHost],
    }).compileComponents();
  });

  it('projects its content into an accessible native dialog', () => {
    const fixture = TestBed.createComponent(ModalHost);
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog');
    expect(dialog.getAttribute('aria-label')).toBe('Crear hábito');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.querySelector('h2')?.textContent).toContain('Crear hábito');
    expect(dialog.querySelector('ng-content')).toBeNull();
    expect(
      dialog.querySelector('[aria-label="Close dialog"]'),
    ).not.toBeNull();
  });

  it('opens from the invoking element and restores focus when closed', () => {
    const fixture = TestBed.createComponent(ModalHost);
    fixture.detectChanges();

    const trigger =
      fixture.nativeElement.querySelector<HTMLButtonElement>('.test-trigger')!;
    const dialog =
      fixture.nativeElement.querySelector<HTMLDialogElement>('dialog')!;
    mockNativeDialog(dialog);

    trigger.click();
    expect(dialog.open).toBe(true);
    expect(document.activeElement).toBe(
      dialog.querySelector('input[autofocus]'),
    );

    fixture.nativeElement
      .querySelector<HTMLButtonElement>('[aria-label="Close dialog"]')!
      .click();

    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('closes on Escape', () => {
    const fixture = TestBed.createComponent(ModalHost);
    fixture.detectChanges();

    const trigger =
      fixture.nativeElement.querySelector<HTMLButtonElement>('.test-trigger')!;
    const dialog =
      fixture.nativeElement.querySelector<HTMLDialogElement>('dialog')!;
    mockNativeDialog(dialog);
    trigger.click();

    const cancelEvent = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancelEvent);

    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });
});
