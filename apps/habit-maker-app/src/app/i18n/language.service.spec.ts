import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { provideTranslocoTesting } from '../../../test-support/transloco-testing';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  beforeEach(() => {
    localStorage.removeItem('habitmaker.language');
    TestBed.configureTestingModule({ providers: [provideTranslocoTesting()] });
  });

  afterEach(() => localStorage.removeItem('habitmaker.language'));

  it('selects the first supported browser language', () => {
    Object.defineProperty(window.navigator, 'languages', {
      configurable: true,
      value: ['fr-FR', 'es-MX', 'en-US'],
    });

    const languageService = TestBed.inject(LanguageService);

    expect(languageService.language()).toBe('es');
    expect(document.documentElement.lang).toBe('es');
  });

  it('falls back to English when the browser language is not supported', () => {
    Object.defineProperty(window.navigator, 'languages', {
      configurable: true,
      value: ['fr-FR', 'de-DE'],
    });

    expect(TestBed.inject(LanguageService).language()).toBe('en');
  });

  it('persists a manually selected language', () => {
    const languageService = TestBed.inject(LanguageService);
    languageService.setLanguage('en');

    expect(languageService.language()).toBe('en');
    expect(languageService.locale()).toBe('en-US');
    expect(localStorage.getItem('habitmaker.language')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(TestBed.inject(TranslocoService).getActiveLang()).toBe('en');
  });
});
