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

@Component({
  imports: [HabitMakerUIIcon],
  template: '<hm-icon name="check" /><hm-icon name="clock" />',
})
class CompletionIconsHostComponent {}

@Component({
  imports: [HabitMakerUIIcon],
  template: '<hm-icon name="arrow-left" />',
})
class ArrowLeftIconHostComponent {}

@Component({
  imports: [HabitMakerUIIcon],
  template: `
    <hm-icon name="arrow-right" />
    <hm-icon name="brand-mark" />
    <hm-icon name="chevron-left" />
    <hm-icon name="chevron-right" />
    <hm-icon name="close" />
    <hm-icon name="eye" />
    <hm-icon name="eye-off" />
    <hm-icon name="sparkle" />
    <hm-icon name="sprout" />
  `,
})
class AdditionalIconsHostComponent {}

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

  it('references the completion status SVG assets', async () => {
    await TestBed.configureTestingModule({
      imports: [CompletionIconsHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(CompletionIconsHostComponent);
    fixture.detectChanges();

    expect(
      Array.from(
        fixture.nativeElement.querySelectorAll('use'),
        (use: SVGUseElement) => use.getAttribute('href'),
      ),
    ).toEqual(['assets/icons/check.svg#check', 'assets/icons/clock.svg#clock']);
  });

  it('references the arrow-left SVG asset', async () => {
    await TestBed.configureTestingModule({
      imports: [ArrowLeftIconHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArrowLeftIconHostComponent);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('use')?.getAttribute('href'),
    ).toBe('assets/icons/arrow-left.svg#arrow-left');
  });

  it('references the additional registered SVG assets', async () => {
    await TestBed.configureTestingModule({
      imports: [AdditionalIconsHostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdditionalIconsHostComponent);
    fixture.detectChanges();

    expect(
      Array.from(
        fixture.nativeElement.querySelectorAll('use'),
        (use: SVGUseElement) => use.getAttribute('href'),
      ),
    ).toEqual([
      'assets/icons/arrow-right.svg#arrow-right',
      'assets/icons/brand-mark.svg#brand-mark',
      'assets/icons/chevron-left.svg#chevron-left',
      'assets/icons/chevron-right.svg#chevron-right',
      'assets/icons/close.svg#close',
      'assets/icons/eye.svg#eye',
      'assets/icons/eye-off.svg#eye-off',
      'assets/icons/sparkle.svg#sparkle',
      'assets/icons/sprout.svg#sprout',
    ]);
  });
});
