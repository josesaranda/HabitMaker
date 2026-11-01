import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HabitMakerUIIcon } from './habit-maker-ui-icon';

@Component({
  imports: [HabitMakerUIIcon],
  template: '<hm-icon name="logout" />',
})
class HostComponent {}

describe('HabitMakerUIIcon', () => {
  it('references the SVG asset for its icon name decoratively', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('svg') as SVGElement;
    const use = icon.querySelector('use');
    expect(use?.getAttribute('href')).toBe('assets/icons/logout.svg#logout');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });
});
