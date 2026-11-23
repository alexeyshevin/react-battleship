import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { fallbackLanguage, languages } from './languages';
import { ru } from './locales/ru';
import { en } from './locales/en';

const updateDocumentLanguage = () => {
  document.documentElement.lang = i18n.resolvedLanguage ?? fallbackLanguage;
  document.title = i18n.t('app.title');
};

i18n.on('languageChanged', updateDocumentLanguage);

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    initAsync: false,
    resources: { ru: { translation: ru }, en: { translation: en } },
    supportedLngs: languages.map((language) => language.code),
    fallbackLng: fallbackLanguage,
    load: 'languageOnly',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'battleship.language',
    },
    interpolation: { escapeValue: false },
  });

updateDocumentLanguage();

export default i18n;
