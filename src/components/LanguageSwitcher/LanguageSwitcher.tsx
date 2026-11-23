import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { fallbackLanguage, languages } from '../../i18n/languages';
import './LanguageSwitcher.css';

const renderLanguageOption = (language: (typeof languages)[number]) => {
  return (
    <option key={language.code} value={language.code} lang={language.code}>
      {language.label}
    </option>
  );
};

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    void i18n.changeLanguage(event.target.value);
  };

  return (
    <label className='label'>
      {t('language.label')}{' '}
      <select
        value={i18n.resolvedLanguage ?? fallbackLanguage}
        onChange={handleLanguageChange}
        className='switcher'
      >
        {languages.map(renderLanguageOption)}
      </select>
    </label>
  );
};
