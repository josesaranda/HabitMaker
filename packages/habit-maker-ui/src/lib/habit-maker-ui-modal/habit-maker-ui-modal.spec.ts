import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HabitMakerUIModal } from './habit-maker-ui-modal';
import { HabitMakerUIModalTitle } from './habit-maker-ui-modal-title';
import { HabitMakerUIModalContent } from './habit-maker-ui-modal-content';

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

@Component({
  imports: [
    HabitMakerUIModal,
    HabitMakerUIModalTitle,
    HabitMakerUIModalContent,
  ],
  template: `
    <habit-maker-ui-modal #modal label="Detalles del hábito">
      <h2 hmModalTitle>Detalles del hábito</h2>
      <div hmModalContent>
        <p>El contenido se proyecta dentro del modal.</p>
      </div>
    </habit-maker-ui-modal>
  `,
})
class TitledModalHost {}

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
      imports: [ModalHost, TitledModalHost],
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
    expect(dialog.querySelector('[aria-label="Close dialog"]')).not.toBeNull();
  });

  it('renders a title beside the close button when hmModalTitle is present', () => {
    const fixture = TestBed.createComponent(TitledModalHost);
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog');
    const header = dialog.querySelector('.hm-modal__header');
    expect(header.getAttribute('class')).toContain('hm-modal__header--titled');
    expect(header.querySelector('.hm-modal__title')?.textContent).toContain(
      'Detalles del hábito',
    );
    // The title is placed in the header row, not duplicated in the content.
    expect(dialog.querySelector('.hm-modal__content h2')).toBeNull();
    expect(header.querySelector('.hm-modal__close-button')).not.toBeNull();
    // Content marked with hmModalContent stays in the content area.
    expect(
      dialog.querySelector('.hm-modal__content [hmModalContent] p'),
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
