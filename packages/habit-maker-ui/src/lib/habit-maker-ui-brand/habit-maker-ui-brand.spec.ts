import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HabitMakerUIBrand } from './habit-maker-ui-brand';

@Component({
  imports: [HabitMakerUIBrand],
  template: '<hm-brand></hm-brand>',
})
class HostComponent {}

describe('HabitMakerUIBrand', () => {
  it('renders the accessible wordmark and decorative icon', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const brand: HTMLElement = fixture.nativeElement.querySelector('hm-brand');
    const mark = brand.querySelector<HTMLElement>('.brand-mark');

    expect(brand.textContent).toContain('HabitMaker');
    expect(mark).not.toBeNull();
    expect(mark?.getAttribute('aria-hidden')).toBe('true');
    expect(mark?.querySelector('svg')).not.toBeNull();
  });
});
