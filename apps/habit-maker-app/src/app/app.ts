import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import {
  HabitMakerUIButtonIcon,
  HabitMakerUIIcon,
  HabitMakerUINavbar,
} from '@habit-maker/habit-maker-ui';
import { filter, map } from 'rxjs';
import { AuthService } from './auth/auth.service';

@Component({
  imports: [
    HabitMakerUIButtonIcon,
    HabitMakerUIIcon,
    HabitMakerUINavbar,
    RouterLink,
    RouterOutlet,
    TranslocoPipe,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  protected readonly shouldShowNavbar = computed(() => {
    const currentPath = this.currentUrl().split(/[?#]/, 1)[0];
    const isAuthPage =
      currentPath === '/login' ||
      currentPath === '/signup' ||
      currentPath === '/forgot-password';

    return this.authService.authenticated() && !isAuthPage;
  });

  protected logout(): void {
    this.authService.logout({ deferStateUpdate: true });
    void this.router
      .navigateByUrl('/login')
      .finally(() => this.authService.syncAuthenticatedState());
  }
}
