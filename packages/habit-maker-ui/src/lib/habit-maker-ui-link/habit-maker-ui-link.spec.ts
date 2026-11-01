import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HabitMakerUILink } from './habit-maker-ui-link';

@Component({
  imports: [HabitMakerUILink],
  template: '<a hmLink href="#hello-world">Hello world</a>',
})
class HostComponent {}

describe('HabitMakerUILink', () => {
  it('applies the green link styles to anchors', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(anchor.classList).toContain('text-green-950');
    expect(anchor.classList).toContain('hover:text-green-600');
  });
});
