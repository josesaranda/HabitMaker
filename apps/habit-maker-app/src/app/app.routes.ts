import { Route } from '@angular/router';
import { authGuard, guestGuard } from '@habit-maker/auth-data-access';
import { habitDetailResolver } from '@habit-maker/habits-feature';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('@habit-maker/auth-feature').then((module) => module.Login),
    canActivate: [guestGuard],
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('@habit-maker/auth-feature').then((module) => module.Signup),
    canActivate: [guestGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('@habit-maker/auth-feature').then(
        (module) => module.RecoverPassword,
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('@habit-maker/auth-feature').then(
        (module) => module.ResetPassword,
      ),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('@habit-maker/habits-feature').then((module) => module.Home),
    canActivate: [authGuard],
  },
  {
    path: 'today',
    loadComponent: () =>
      import('@habit-maker/today-feature').then((module) => module.Today),
    canActivate: [authGuard],
  },
  {
    path: 'habits/:id',
    loadComponent: () =>
      import('@habit-maker/habits-feature').then(
        (module) => module.HabitDetail,
      ),
    canActivate: [authGuard],
    resolve: { habitResult: habitDetailResolver },
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('@habit-maker/settings-feature').then((module) => module.Settings),
    canActivate: [authGuard],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
