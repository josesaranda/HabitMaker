import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HabitMakerUIHeader } from './habit-maker-ui-header';

@Component({
  imports: [HabitMakerUIHeader],
  template: `
    <habit-maker-ui-header backNavigation="/">Tus hábitos</habit-maker-ui-header>
  `,
})
class HeaderWithBackNavigation {}

@Component({
  imports: [HabitMakerUIHeader],
  template: '<habit-maker-ui-header>Configuración</habit-maker-ui-header>',
})
class HeaderWithoutBackNavigation {}

describe('HabitMakerUIHeader', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  it('renders the title and links the back icon to the configured route', async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderWithBackNavigation],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeaderWithBackNavigation);
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector(
      'habit-maker-ui-header',
    ) as HTMLElement;
    const backLink = header.querySelector('a');

    expect(header.querySelector('h1')?.textContent?.trim()).toBe('Tus hábitos');
    expect(backLink?.getAttribute('href')).toBe('/');
    expect(backLink?.querySelector('hm-icon[name="arrow-left"]')).not.toBeNull();
  });

  it('does not render a back link when no destination is provided', async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderWithoutBackNavigation],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeaderWithoutBackNavigation);
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector(
      'habit-maker-ui-header',
    ) as HTMLElement;

    expect(header.querySelector('h1')?.textContent?.trim()).toBe(
      'Configuración',
    );
    expect(header.querySelector('a')).toBeNull();
  });
});
