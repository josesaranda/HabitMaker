import { Component, Directive } from '@angular/core';

@Component({
  selector: 'hm-form-field',
  standalone: true,
  template: `
    <ng-content select="[hmLabel]" />
    <div class="hm-form-field__control">
      <ng-content select="input, textarea, select" />
      <ng-content select="[hmIconRight]" />
    </div>
    <ng-content select="[hmHint]" />
    <ng-content select="[hmError]" />
    <ng-content />
  `,
  host: {
    class: 'hm-form-field',
  },
})
export class HabitMakerUIFormField {}

@Directive({
  selector: 'label[hmLabel]',
  standalone: true,
  host: {
    class: 'hm-form-field__label hm-text hm-text--caption',
  },
})
export class HabitMakerUIFormFieldLabel {}

@Directive({
  selector: 'button[hmIconRight]',
  standalone: true,
  host: {
    class: 'hm-form-field__icon-right',
  },
})
export class HabitMakerUIFormFieldIconRight {}

@Directive({
  selector: '[hmHint]',
  standalone: true,
  host: {
    class: 'hm-form-field__hint hm-text hm-text--caption',
  },
})
export class HabitMakerUIFormFieldHint {}

@Directive({
  selector: '[hmError]',
  standalone: true,
  host: {
    class: 'hm-form-field__error hm-text hm-text--caption',
    role: 'alert',
    'aria-live': 'assertive',
  },
})
export class HabitMakerUIFormFieldError {}
