import { TestBed } from '@angular/core/testing';
import { provideTranslocoTesting } from '@habit-maker/test-support';
import { TitleService } from './title.service';

describe('TitleService', () => {
  it('sets the page title with the HabitMaker brand', () => {
    TestBed.configureTestingModule({
      providers: [provideTranslocoTesting()],
    });
    const titleService = TestBed.inject(TitleService);

    titleService.setTitle('pageTitles.home');

    expect(document.title).toBe('Mis hábitos | HabitMaker');
  });
});
