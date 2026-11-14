import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HabitMakerUICheckbox } from './habit-maker-ui-checkbox';

@Component({
  imports: [HabitMakerUICheckbox],
  template: '<input hmCheckbox type="checkbox" aria-label="Recordarme" />',
})
class HostComponent {}

describe('HabitMakerUICheckbox', () => {
  it('applies the BEM checkbox class to native checkboxes', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const checkbox: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    expect(checkbox.type).toBe('checkbox');
    expect(checkbox.classList).toContain('hm-checkbox');
  });
});
