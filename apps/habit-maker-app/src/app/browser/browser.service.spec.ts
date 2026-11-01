import { TestBed } from '@angular/core/testing';
import { BrowserService } from './browser.service';

describe('BrowserService', () => {
  it('sets the page title with the HabitMaker brand', () => {
    const browserService = TestBed.inject(BrowserService);

    browserService.setTitle('Mis hábitos | HabitMaker');

    expect(document.title).toBe('Mis hábitos | HabitMaker');
  });
});
