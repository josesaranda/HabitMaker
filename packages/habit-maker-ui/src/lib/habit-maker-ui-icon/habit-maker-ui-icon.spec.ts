import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HabitMakerUIIcon } from './habit-maker-ui-icon';

@Component({
  imports: [HabitMakerUIIcon],
  template: '<hm-icon name="logout" />',
})
class HostComponent {}

@Component({
  imports: [HabitMakerUIIcon],
  template: '<hm-icon name="add" />',
})
class AddIconHostComponent {}

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

  it('references the add SVG asset', async () => {
    await TestBed.configureTestingModule({
      imports: [AddIconHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(AddIconHostComponent);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('use')?.getAttribute('href'),
    ).toBe('assets/icons/add.svg#add');
  });
});
