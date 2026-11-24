import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import {
  HabitMakerUIButtonIcon,
  HabitMakerUIHeaderOutlet,
  HabitMakerUIIcon,
  HabitMakerUINavbar,
  HabitMakerUIText,
} from '@habit-maker/habit-maker-ui';
import { filter, map } from 'rxjs';
import { AuthService } from '@habit-maker/auth-data-access';
import { AppUpdateService } from '@habit-maker/settings-data-access';
import {
  getDesktopApiUrl,
  isDesktopApp,
} from '@habit-maker/shared-data-access';
import { DesktopMenuService } from '@habit-maker/desktop-data-access';
import { DesktopReminderService } from '@habit-maker/habits-data-access';
import { DesktopSetup } from './desktop-setup/desktop-setup';

@Component({
  imports: [
    DesktopSetup,
    HabitMakerUIText,
    HabitMakerUIButtonIcon,
    HabitMakerUIHeaderOutlet,
    HabitMakerUIIcon,
    HabitMakerUINavbar,
    RouterLink,
    RouterLinkActive,
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
  private readonly desktopMenuService = inject(DesktopMenuService);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  protected readonly currentDay = computed(() => new Date().getDate());
  protected readonly currentPath = computed(
    () => this.currentUrl().split(/[?#]/, 1)[0],
  );
  protected readonly shouldShowNavbar = computed(() => {
    const currentPath = this.currentPath();
    const isAuthPage =
      currentPath === '/login' ||
      currentPath === '/signup' ||
      currentPath === '/forgot-password' ||
      currentPath === '/reset-password';

    return this.authService.authenticated() && !isAuthPage;
  });
  protected readonly isTodayActive = computed(
    () => this.currentPath() === '/today',
  );
  protected readonly isSettingsActive = computed(
    () => this.currentPath() === '/settings',
  );
  protected readonly desktopSetupRequired = signal(
    isDesktopApp() && !getDesktopApiUrl(),
  );

  constructor() {
    inject(AppUpdateService);

    if (isDesktopApp()) {
      void this.desktopMenuService.setup();
      const desktopReminderService = inject(DesktopReminderService);
      desktopReminderService.start();
      effect(() => {
        if (this.desktopMenuService.connectRequested() > 0) {
          this.desktopSetupRequired.set(true);
        }
      });
    }
  }

  protected reloadAfterDesktopSetup(): void {
    window.location.reload();
  }

  public connectToServer(): void {
    this.desktopMenuService.connectToServer();
    this.desktopSetupRequired.set(true);
  }

  protected logout(): void {
    this.authService.logout({ deferStateUpdate: true });
    void this.router
      .navigateByUrl('/login')
      .finally(() => this.authService.syncAuthenticatedState());
  }
}
