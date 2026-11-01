import { Route } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { Home } from './home/home';
import { Login } from './login/login';
import { Signup } from './signup/signup';

export const appRoutes: Route[] = [
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
