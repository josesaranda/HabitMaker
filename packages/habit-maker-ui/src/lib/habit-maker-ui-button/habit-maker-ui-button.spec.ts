import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HabitMakerUIButton } from './habit-maker-ui-button';

@Component({
  imports: [HabitMakerUIButton],
  template:
    '<button hmButton="primary" type="button">Save</button><a hmButton="secondary" href="#save">Cancel</a>',
})
class HostComponent {}

describe('HabitMakerUIButton', () => {
  it('supports primary and secondary variants on buttons and anchors', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');

    expect(button.classList).toContain('hm-button');
    expect(button.classList).toContain('hm-button--primary');
    expect(anchor.classList).toContain('hm-button');
    expect(anchor.classList).toContain('hm-button--secondary');
  });
});
