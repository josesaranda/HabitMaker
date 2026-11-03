import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { HabitMakerUIOption } from '../habit-maker-ui-option/habit-maker-ui-option';
import { HabitMakerUISelect } from './habit-maker-ui-select';

@Component({
  imports: [ReactiveFormsModule, HabitMakerUISelect, HabitMakerUIOption],
  template: `
    <label id="locale-label">Language</label>
    <habit-maker-ui-select
      [aria-labelledby]="'locale-label'"
      [formControl]="language"
    >
      <habit-maker-ui-option [value]="'en'" [label]="'English'">
        English
      </habit-maker-ui-option>
      <habit-maker-ui-option [value]="'es'" [label]="'Spanish'">
        Spanish
      </habit-maker-ui-option>
      <habit-maker-ui-option
        [value]="'fr'"
        [label]="'French'"
        [disabled]="true"
      >
        French
      </habit-maker-ui-option>
    </habit-maker-ui-select>
  `,
})
class SelectHostComponent {
  readonly language = new FormControl('es');
}

describe('HabitMakerUISelect', () => {
  it('exposes an accessible combobox and listbox with keyboard selection', async () => {
    await TestBed.configureTestingModule({
      imports: [SelectHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SelectHostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector<HTMLButtonElement>(
      '.hm-ui-select__trigger',
    )!;
    const listbox = host.querySelector<HTMLElement>('[role="listbox"]')!;
    const options = host.querySelectorAll<HTMLElement>('[role="option"]');

    expect(trigger.getAttribute('role')).toBe('combobox');
    expect(trigger.getAttribute('aria-labelledby')).toBe('locale-label');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBe(listbox.id);
    expect(trigger.textContent).toContain('Spanish');
    expect(options).toHaveLength(3);
    expect(options[1].getAttribute('aria-selected')).toBe('true');
    expect(options[2].getAttribute('aria-disabled')).toBe('true');

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-activedescendant')).toBe(options[1].id);

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.language.value).toBe('en');
    expect(trigger.textContent).toContain('English');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('reports option selection and disabled state through Angular Forms', async () => {
    await TestBed.configureTestingModule({
      imports: [SelectHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SelectHostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const control = fixture.componentInstance.language;
    const trigger = host.querySelector<HTMLButtonElement>(
      '.hm-ui-select__trigger',
    )!;

    control.setValue('en');
    fixture.detectChanges();
    expect(trigger.textContent).toContain('English');

    trigger.dispatchEvent(new FocusEvent('blur'));
    expect(control.touched).toBe(true);

    control.disable();
    fixture.detectChanges();
    expect(trigger.disabled).toBe(true);
  });
});
