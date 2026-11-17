import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();

  return (
    <label>
      {t('language.label')}{' '}
      <select
        value={i18n.resolvedLanguage ?? 'ru'}
        onChange={(event) => { void i18n.changeLanguage(event.target.value); }}
      >
        <option value="ru" lang="ru">Русский</option>
        <option value="en" lang="en">English</option>
      </select>
    </label>
  );
};
