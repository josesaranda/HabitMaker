import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  HabitMakerUIFormFieldError,
  HabitMakerUIFormFieldHint,
  HabitMakerUIFormFieldIconRight,
  HabitMakerUIFormField,
  HabitMakerUIFormFieldLabel,
} from './habit-maker-ui-form-field';

@Component({
  imports: [
    HabitMakerUIFormField,
    HabitMakerUIFormFieldError,
    HabitMakerUIFormFieldHint,
    HabitMakerUIFormFieldIconRight,
    HabitMakerUIFormFieldLabel,
  ],
  template: `
    <hm-form-field>
      <label hmLabel for="email">Email</label>
      <input id="email" type="email" />
      <button hmIconRight type="button">Show password</button>
      <p hmHint>Use your email to log in</p>
      <p hmError>Invalid email or password</p>
    </hm-form-field>
  `,
})
class HostComponent {}

describe('HabitMakerUIFormField', () => {
  it('projects the label and input into the field', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const field: HTMLElement =
      fixture.nativeElement.querySelector('hm-form-field');
    const label: HTMLLabelElement = field.querySelector('label')!;
    const input: HTMLInputElement = field.querySelector('input')!;
    const iconButton: HTMLButtonElement = field.querySelector('button')!;
    const control: HTMLElement = field.querySelector(
      '.hm-form-field__control',
    )!;
    const hint: HTMLParagraphElement = field.querySelector('[hmHint]')!;
    const error: HTMLParagraphElement = field.querySelector('[hmError]')!;

    expect(label.htmlFor).toBe('email');
    expect(label.classList).toContain('hm-form-field__label');
    expect(input.type).toBe('email');
    expect(iconButton.classList).toContain('hm-form-field__icon-right');
    expect(control.contains(input)).toBe(true);
    expect(control.contains(iconButton)).toBe(true);
    expect(hint.classList).toContain('hm-form-field__hint');
    expect(error.classList).toContain('hm-form-field__error');
    expect(error.getAttribute('role')).toBe('alert');
    expect(error.getAttribute('aria-live')).toBe('assertive');
  });
});
