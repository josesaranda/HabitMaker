import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { appRoutes } from './app.routes';
import { AuthService } from './auth/auth.service';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(appRoutes)],
    }).compileComponents();
  });

  afterEach(() => localStorage.clear());

  it('renders the router outlet and opens the login route by default', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('router-outlet')).not.toBeNull();
    expect(compiled.querySelector('app-login h2')?.textContent).toContain(
      'Inicia sesión',
    );
  });

  it('navigates to the signup page', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/signup');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-signup h2')?.textContent).toContain(
      'Crea tu cuenta',
    );
  });

  it('redirects authenticated users from login and signup to home', async () => {
    TestBed.inject(AuthService).login('persona@example.com', 'password123');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/login');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-home h1')?.textContent).toContain(
      '¡Bienvenido a casa!',
    );

    await router.navigateByUrl('/signup');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-home h1')?.textContent).toContain(
      '¡Bienvenido a casa!',
    );
  });
});
