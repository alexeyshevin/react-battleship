import { useTranslation } from 'react-i18next';
import type { GameMode } from '../../shared/types';
import { Button } from '../ui/Button/Button';
import './ModeSelection.css';

type Props = {
  onSelect: (mode: GameMode) => void;
};

const modes: GameMode[] = ['bot', 'journal'];

export const ModeSelection = (props: Props) => {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="mode-selection-title">
      <h2 id="mode-selection-title">{t('modes.choose')}</h2>
      <div className="mode-selection">
        {modes.map((mode) => (
          <article className="mode-card" key={mode}>
            <h3>{t(`modes.${mode}.title`)}</h3>
            <p>{t(`modes.${mode}.description`)}</p>
            <Button onClick={() => props.onSelect(mode)}>
              {t(`modes.${mode}.select`)}
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
};
