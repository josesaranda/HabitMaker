import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HabitMakerUIText } from './habit-maker-ui-text';

@Component({
  imports: [HabitMakerUIText],
  template: '<p hmText="body-xs">Hello world</p>',
})
class HostComponent {}

describe('HabitMakerUIText', () => {
  it('applies the text class and variant modifier', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const paragraph: HTMLParagraphElement =
      fixture.nativeElement.querySelector('p');
    expect(paragraph.classList).toContain('hm-text');
    expect(paragraph.classList).toContain('hm-text--body-xs');
  });
});
