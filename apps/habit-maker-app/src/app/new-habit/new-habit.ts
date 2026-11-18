import { Component, computed, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  HabitMakerUIButton,
  HabitMakerUIEmojiPicker,
  HabitMakerUIFormField,
  HabitMakerUIFormFieldError,
  HabitMakerUIFormFieldHint,
  HabitMakerUIFormFieldLabel,
  HabitMakerUIIcon,
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
    HabitMakerUIIcon,
    HabitMakerUIInput,
    HabitMakerUIFormField,
    HabitMakerUIFormFieldError,
    HabitMakerUIFormFieldHint,
    HabitMakerUIFormFieldLabel,
    HabitMakerUIEmojiPicker,
    ReactiveFormsModule,
    TranslocoPipe,
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
    emoji: new FormControl<string | null>(null),
  });
  protected readonly selectedEmoji = toSignal(
    this.habitForm.controls.emoji.valueChanges.pipe(
      startWith(this.habitForm.controls.emoji.value),
    ),
    { initialValue: this.habitForm.controls.emoji.value },
  );
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly nameTouched = signal(false);
  readonly habitCreated = output<void>();
  private readonly formStatus = toSignal(
    this.habitForm.statusChanges.pipe(startWith(this.habitForm.status)),
    { initialValue: this.habitForm.status },
  );
  protected readonly canStartHabit = computed(
    () => this.formStatus() === 'VALID' && !this.isSubmitting(),
  );
  protected readonly nameError = computed(() => {
    this.formStatus();
    this.nameTouched();
    const control = this.habitForm.controls.name;
    if (!this.nameTouched() || control.valid) return '';
    return control.hasError('maxlength')
      ? 'newHabit.nameTooLong'
      : 'newHabit.nameRequired';
  });

  protected createHabit(): void {
    if (this.habitForm.invalid || this.isSubmitting()) {
      this.habitForm.markAllAsTouched();
      this.nameTouched.set(true);
      return;
    }

    const name = this.habitForm.controls.name.value.trim();
    const emoji = this.habitForm.controls.emoji.value;

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.habitService
      .createHabit(name, emoji)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.habitForm.reset({ name: '', emoji: null });
          this.nameTouched.set(false);
          this.habitCreated.emit();
        },
        error: () => this.errorMessage.set('newHabit.error'),
      });
  }

  protected selectEmoji(emoji: string | null): void {
    this.habitForm.controls.emoji.setValue(emoji);
  }
}
