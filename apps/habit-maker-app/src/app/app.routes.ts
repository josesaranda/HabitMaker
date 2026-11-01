import { Route } from '@angular/router';
import { Login } from './login/login';
import { Signup } from './signup/signup';

export const appRoutes: Route[] = [
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
