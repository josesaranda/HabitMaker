import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HabitMakerUIBrand } from '@habit-maker/habit-maker-ui';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  imports: [HabitMakerUIBrand],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
