import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_STORAGE_KEY = 'habitmaker.language';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly transloco = inject(TranslocoService);
  private readonly currentLanguage = signal<SupportedLanguage>(
    this.getInitialLanguage(),
  );

  readonly language = this.currentLanguage.asReadonly();
  readonly locale = computed(() =>
    this.currentLanguage() === 'es' ? 'es-ES' : 'en-US',
  );

  constructor() {
    this.activateLanguage(this.currentLanguage());
  }

  setLanguage(language: SupportedLanguage): void {
    if (!SUPPORTED_LANGUAGES.includes(language)) return;

    this.currentLanguage.set(language);
    this.activateLanguage(language);
    try {
      this.document.defaultView?.localStorage.setItem(
        LANGUAGE_STORAGE_KEY,
        language,
      );
    } catch {
      // Language switching still works when browser storage is unavailable.
    }
  }

  private activateLanguage(language: SupportedLanguage): void {
    this.document.documentElement.lang = language;
    this.transloco.setActiveLang(language);
  }

  private getInitialLanguage(): SupportedLanguage {
    try {
      const storedLanguage = this.document.defaultView?.localStorage.getItem(
        LANGUAGE_STORAGE_KEY,
      );
      if (this.isSupportedLanguage(storedLanguage)) return storedLanguage;
    } catch {
      // Fall back to the browser language when storage cannot be read.
    }

    const navigator = this.document.defaultView?.navigator;
    const browserLanguages = navigator?.languages?.length
      ? navigator.languages
      : [navigator?.language ?? ''];

    return (
      browserLanguages
        .map((language) => language.toLowerCase().split(/[-_]/, 1)[0])
        .find((language): language is SupportedLanguage =>
          this.isSupportedLanguage(language),
        ) ?? 'en'
    );
  }

  private isSupportedLanguage(
    language: string | null | undefined,
  ): language is SupportedLanguage {
    return (
      language !== null &&
      language !== undefined &&
      SUPPORTED_LANGUAGES.some((supported) => supported === language)
    );
  }
}
