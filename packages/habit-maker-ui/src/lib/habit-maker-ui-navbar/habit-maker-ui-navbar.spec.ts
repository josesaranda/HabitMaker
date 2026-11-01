import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HabitMakerUINavbar } from './habit-maker-ui-navbar';

@Component({
  imports: [HabitMakerUINavbar],
  template: `<hm-navbar brandLink="/home">
    <a class="test-link" routerLink="/home">Inicio</a>
    <button class="test-button" type="button" (click)="clicked = true">
      Acción
    </button>
  </hm-navbar>`,
})
class HostComponent {
  clicked = false;
}

describe('HabitMakerUINavbar', () => {
  it('renders the brand and projects children into the right-side actions area', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('hm-brand')).not.toBeNull();
    const actions = compiled.querySelector('.hm-navbar__actions');
    expect(actions?.querySelector('.test-link')?.textContent).toContain('Inicio');
    expect(actions?.querySelector('.test-button')?.textContent).toContain('Acción');
  });

  it('keeps projected child actions interactive', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.hm-navbar__actions .test-button')
      ?.click();

    expect(fixture.componentInstance.clicked).toBe(true);
  });
});
