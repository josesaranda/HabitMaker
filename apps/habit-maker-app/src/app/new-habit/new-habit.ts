import { Component, computed, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  HabitMakerUIButton,
  HabitMakerUIInput,
} from '@habit-maker/habit-maker-ui';
import { finalize, startWith } from 'rxjs';
import { HabitService } from '../habits/habit.service';

const nonBlankValidator: ValidatorFn = (control) =>
  typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { nonBlank: true };

@Component({
  selector: 'app-new-habit',
  imports: [
    HabitMakerUIButton,
    HabitMakerUIInput,
    ReactiveFormsModule,
  ],
  templateUrl: './new-habit.html',
  host: { class: 'block' },
})
export class NewHabit {
  private readonly habitService = inject(HabitService);
  protected readonly habitForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(100),
        nonBlankValidator,
      ],
    }),
  });
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  readonly habitCreated = output<void>();
  private readonly formStatus = toSignal(
    this.habitForm.statusChanges.pipe(startWith(this.habitForm.status)),
    { initialValue: this.habitForm.status },
  );
  protected readonly canStartHabit = computed(
    () => this.formStatus() === 'VALID' && !this.isSubmitting(),
  );

  protected createHabit(): void {
    if (this.habitForm.invalid || this.isSubmitting()) {
      this.habitForm.markAllAsTouched();
      return;
    }

    const name = this.habitForm.controls.name.value.trim();

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.habitService
      .createHabit(name)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.habitForm.reset();
          this.habitCreated.emit();
        },
        error: () =>
          this.errorMessage.set(
            'No se pudo guardar el hábito. Inténtalo de nuevo.',
          ),
      });
  }
}
