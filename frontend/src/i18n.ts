import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import lt from './locales/lt.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      lt: { translation: lt },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'lt'],
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  });

export default i18n;
