import { defaultLang, ui, type Lang } from './ui';

export function getLangFromUrl(url: URL): Lang {
  const [, firstSegment] = url.pathname.split('/');
  return firstSegment === 'es' ? 'es' : defaultLang;
}

export function useTranslations(lang: Lang) {
  return ui[lang];
}

export function useTranslatedPath(lang: Lang) {
  return function translatePath(path: string, targetLang: Lang = lang) {
    if (targetLang === defaultLang) {
      return path;
    }

    return `/${targetLang}${path}`;
  };
}
