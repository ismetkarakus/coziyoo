import { useCountry } from '../context/CountryContext';
import { translations, TranslationKey } from '../i18n/translations';

export const useTranslation = () => {
  const { currentCountry } = useCountry();
  
  const t = (key: TranslationKey): string => {
    const language = currentCountry.language as keyof typeof translations;
    return translations[language]?.[key] || translations.tr[key] || key;
  };

  return { t };
};