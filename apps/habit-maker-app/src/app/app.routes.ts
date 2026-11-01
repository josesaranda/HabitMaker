import { Route } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { guestGuard } from './auth/guest.guard';
import { Home } from './home/home';
import { Login } from './login/login';
import { RecoverPassword } from './recover-password/recover-password';
import { Signup } from './signup/signup';

export const appRoutes: Route[] = [
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'signup', component: Signup, canActivate: [guestGuard] },
  {
    path: 'forgot-password',
    component: RecoverPassword,
    canActivate: [guestGuard],
  },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
