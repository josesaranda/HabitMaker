import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RecoverPassword } from './recover-password';

describe('RecoverPassword', () => {
  let fixture: ComponentFixture<RecoverPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecoverPassword],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RecoverPassword);
    await fixture.whenStable();
  });

  it('renders the email form and a link back to login', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h2')?.textContent).toContain(
      'Recupera tu contraseña',
    );
    expect(compiled.querySelector('input[hmInput][type="email"]')).not.toBeNull();
    expect(compiled.querySelector('a[routerLink="/login"]')).not.toBeNull();
    expect(compiled.querySelector('button[hmButton="primary"]')).not.toBeNull();
  });

  it('shows a generic confirmation after submitting an email', () => {
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    const email: HTMLInputElement = fixture.nativeElement.querySelector('#email');
    email.value = 'persona@example.com';
    email.dispatchEvent(new Event('input'));

    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Solicitud recibida');
    expect(compiled.querySelector('[role="status"]')?.textContent).toContain(
      'persona@example.com',
    );
    expect(compiled.querySelector('form')).toBeNull();
  });
});
