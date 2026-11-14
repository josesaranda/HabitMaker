import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HabitMakerUIToggle } from './habit-maker-ui-toggle';

@Component({
  imports: [HabitMakerUIToggle],
  template: '<input hmToggle type="checkbox" aria-label="Notificaciones" />',
})
class HostComponent {}

describe('HabitMakerUIToggle', () => {
  it('applies the BEM toggle class to native checkboxes', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const toggle: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    expect(toggle.type).toBe('checkbox');
    expect(toggle.classList).toContain('hm-toggle');
  });
});
