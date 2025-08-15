
import { Language, TranslationKey } from '../types';
import translations from '../translations';

export function useTranslations(lang: Language) {
  return function t(key: TranslationKey): string {
    return translations[lang][key] || translations['en'][key];
  };
}
