import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HabitMakerUIInput } from './habit-maker-ui-input';

@Component({
  imports: [HabitMakerUIInput],
  template: `
    <input hmInput aria-label="Correo electrónico" />
    <input hmInput="error" aria-label="Campo inválido" />
  `,
})
class HostComponent {}

describe('HabitMakerUIInput', () => {
  it('applies the BEM input class to inputs', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.classList).toContain('hm-input');
  });

  it('applies the error variant class when requested', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelectorAll('input')[1];
    expect(input.classList).toContain('hm-input--error');
  });
});
