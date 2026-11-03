import { Route } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { guestGuard } from './auth/guest.guard';
import { habitDetailResolver } from './habit-detail/habit-detail.resolver';
import { homeHabitsResolver } from './home/home.resolver';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((module) => module.Login),
    canActivate: [guestGuard],
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./signup/signup').then((module) => module.Signup),
    canActivate: [guestGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./recover-password/recover-password').then(
        (module) => module.RecoverPassword,
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./reset-password/reset-password').then(
        (module) => module.ResetPassword,
      ),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home').then((module) => module.Home),
    canActivate: [authGuard],
    resolve: { habitsResult: homeHabitsResolver },
  },
  {
    path: 'habits/:id',
    loadComponent: () =>
      import('./habit-detail/habit-detail').then(
        (module) => module.HabitDetail,
      ),
    canActivate: [authGuard],
    resolve: { habitResult: habitDetailResolver },
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./settings/settings').then((module) => module.Settings),
    canActivate: [authGuard],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
