import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HabitMakerUIButtonIcon } from './habit-maker-ui-button-icon';

@Component({
  imports: [HabitMakerUIButtonIcon],
  template: `
    <button hmButtonIcon="primary" size="small" type="button">Add</button>
    <button hmButtonIcon="secondary" type="button">Edit</button>
    <a hmButtonIcon="secondary" size="big" href="#edit">Edit</a>
    <button hmButtonIcon type="button">Default</button>
  `,
})
class HostComponent {}

describe('HabitMakerUIButtonIcon', () => {
  it('applies the selected variant and size to buttons and anchors', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const [smallPrimary, normalSecondary, bigSecondary, defaultButton] =
      fixture.nativeElement.querySelectorAll('button, a');

    expect(smallPrimary.classList).toContain('hm-button-icon');
    expect(smallPrimary.classList).toContain('hm-button-icon--primary');
    expect(smallPrimary.classList).toContain('hm-button-icon--small');
    expect(normalSecondary.classList).toContain('hm-button-icon--secondary');
    expect(normalSecondary.classList).toContain('hm-button-icon--normal');
    expect(bigSecondary.classList).toContain('hm-button-icon--secondary');
    expect(bigSecondary.classList).toContain('hm-button-icon--big');
    expect(defaultButton.classList).toContain('hm-button-icon--primary');
    expect(defaultButton.classList).toContain('hm-button-icon--normal');
  });
});
