import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('renders the login form with shared UI components', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    const email = compiled.querySelector('input[hmInput][type="email"]');
    const password = compiled.querySelector('input[hmInput][type="password"]');

    expect(compiled.querySelector('h2')?.textContent).toContain(
      'Inicia sesión',
    );
    expect(email).not.toBeNull();
    expect(email?.classList).toContain('hm-input');
    expect(password).not.toBeNull();
    expect(compiled.querySelector('button[hmButton="primary"]')).not.toBeNull();
  });

  it('toggles password visibility', () => {
    const toggle: HTMLButtonElement =
      fixture.nativeElement.querySelector('.password-toggle');
    toggle.click();
    fixture.detectChanges();

    const password: HTMLInputElement =
      fixture.nativeElement.querySelector('#password');
    expect(password.type).toBe('text');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
  });
});
