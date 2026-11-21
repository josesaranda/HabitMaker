import { TestBed } from '@angular/core/testing';
import { provideTranslocoTesting } from '@habit-maker/test-support';
import { BrowserService } from './browser.service';

describe('BrowserService', () => {
  it('sets the page title with the HabitMaker brand', () => {
    TestBed.configureTestingModule({
      providers: [provideTranslocoTesting()],
    });
    const browserService = TestBed.inject(BrowserService);

    browserService.setTitle('pageTitles.home');

    expect(document.title).toBe('Mis hábitos | HabitMaker');
  });
});
