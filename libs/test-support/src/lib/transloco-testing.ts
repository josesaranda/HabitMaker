import { Injectable } from '@angular/core';
import {
  provideTransloco,
  Translation,
  TranslocoLoader,
} from '@jsverse/transloco';
import { Observable, of } from 'rxjs';
import english from './i18n/en.json';
import spanish from './i18n/es.json';

@Injectable()
class TestTranslocoLoader implements TranslocoLoader {
  getTranslation(language: string): Observable<Translation> {
    return of(language === 'es' ? spanish : english);
  }
}

export function provideTranslocoTesting() {
  Object.defineProperty(window.navigator, 'languages', {
    configurable: true,
    value: ['es-ES'],
  });

  return provideTransloco({
    config: {
      availableLangs: ['en', 'es'],
      defaultLang: 'es',
      fallbackLang: 'en',
      reRenderOnLangChange: true,
      prodMode: true,
    },
    loader: TestTranslocoLoader,
  });
}
