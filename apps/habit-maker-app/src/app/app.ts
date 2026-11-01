import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { HabitMakerUIIcon, HabitMakerUINavbar } from '@habit-maker/habit-maker-ui';
import { AuthService } from './auth/auth.service';

@Component({
  imports: [HabitMakerUIIcon, HabitMakerUINavbar, RouterLink, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
