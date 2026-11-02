import { Component, inject, OnInit, signal } from '@angular/core';
import {
  HabitMakerUIHeader,
  HabitMakerUIInput,
} from '@habit-maker/habit-maker-ui';
import { finalize } from 'rxjs';
import { AdminService, AdminUser } from '../admin/admin.service';
import { BrowserService } from '../browser/browser.service';
import { AuthService } from '../auth/auth.service';

@Component({
  imports: [HabitMakerUIHeader, HabitMakerUIInput],
  selector: 'app-settings',
  templateUrl: './settings.html',
})
export class Settings implements OnInit {
  private readonly browserService = inject(BrowserService);
  private readonly authService = inject(AuthService);
  private readonly adminService = inject(AdminService);
  protected readonly email = signal(this.authService.getUserEmail());
  protected readonly isAdmin = signal(
    this.authService.getUserRole() === 'admin',
  );
  protected readonly users = signal<AdminUser[]>([]);
  protected readonly isLoadingUsers = signal(false);
  protected readonly usersLoadError = signal('');

  constructor() {
    this.browserService.setTitle('Ajustes');
  }

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.loadUsers();
    }
  }

  private loadUsers(): void {
    this.isLoadingUsers.set(true);
    this.adminService
      .getUsers()
      .pipe(finalize(() => this.isLoadingUsers.set(false)))
      .subscribe({
        next: (users) => this.users.set(users),
        error: () => {
          this.users.set([]);
          this.usersLoadError.set('No se pudieron cargar los usuarios.');
        },
      });
  }
}
