import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HabitMakerUIButton } from '../habit-maker-ui-button/habit-maker-ui-button';
import { HabitMakerUIButtonIcon } from '../habit-maker-ui-button-icon/habit-maker-ui-button-icon';
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

@Component({
  imports: [HabitMakerUIButton, HabitMakerUIButtonIcon, HabitMakerUIHeader],
  template: `
    <habit-maker-ui-header>
      Tus hábitos
      <button hmButton="primary" type="button">Crear hábito</button>
      <button hmButtonIcon="primary" type="button" aria-label="Añadir hábito">
        +
      </button>
    </habit-maker-ui-header>
  `,
})
class HeaderWithActions {}

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
    expect(
      header.querySelector('.habit-maker-ui-header__actions--visible'),
    ).toBeNull();
  });

  it('projects button actions to the right-side actions region', async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderWithActions],
    }).compileComponents();

    const fixture = TestBed.createComponent(HeaderWithActions);
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector(
      'habit-maker-ui-header',
    ) as HTMLElement;
    const actions = header.querySelector('.habit-maker-ui-header__actions');

    expect(header.querySelector('h1')?.textContent?.trim()).toBe('Tus hábitos');
    expect(actions?.classList).toContain(
      'habit-maker-ui-header__actions--visible',
    );
    expect(actions?.querySelector('button[hmButton]')?.textContent?.trim()).toBe(
      'Crear hábito',
    );
    expect(
      actions?.querySelector('button[hmButtonIcon]')?.getAttribute('aria-label'),
    ).toBe('Añadir hábito');
  });
});
