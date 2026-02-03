import { useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../i18n/translations';

export const useTranslation = () => {
  const { currentLanguage } = useLanguage();

  const t = useCallback((
    key: string,
    params?: Record<string, string | number>
  ): string => {
    const keys = key.split('.');
    const language = currentLanguage as keyof typeof translations;

    let value: any = translations[language];
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    if (value === undefined) {
      value = translations.tr;
      for (const k of keys) {
        value = value?.[k];
        if (value === undefined) break;
      }
    }

    if (typeof value === 'string' && params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return String(params[paramKey] ?? match);
      });
    }

    return value || key;
  }, [currentLanguage]);

  return { t, currentLanguage };
};
