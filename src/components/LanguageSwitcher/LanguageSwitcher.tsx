import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

type Props = Record<string, never>;

export const LanguageSwitcher = (_props: Props) => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    void i18n.changeLanguage(event.target.value);
  };

  return (
    <label>
      {t('language.label')}{' '}
      <select
        value={i18n.resolvedLanguage ?? 'ru'}
        onChange={handleLanguageChange}
      >
        <option value="ru" lang="ru">Русский</option>
        <option value="en" lang="en">English</option>
      </select>
    </label>
  );
};
