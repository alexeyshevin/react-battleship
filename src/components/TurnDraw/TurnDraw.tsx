import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { chooseBotNumber, DRAW_DURATION_MS, DRAW_NUMBERS, drawFirstTurn } from '../../shared/helpers/drawFirstTurn';
import type { DrawState, Player } from '../../shared/types';
import { Button } from '../ui/Button/Button';
import './TurnDraw.css';

type Props = {
  onComplete: (firstPlayer: Player) => void;
};

export const TurnDraw = (props: Props) => {
  const { t } = useTranslation();
  const [draw, setDraw] = useState<DrawState>({ phase: 'choosing', selection: null });
  const { onComplete } = props;

  useEffect(() => {
    if (draw.phase !== 'spinning') {
      return;
    }

    const timeout = window.setTimeout(() => {
      setDraw({ ...draw, phase: 'complete' });
      onComplete(draw.winner);
    }, DRAW_DURATION_MS);

    return () => window.clearTimeout(timeout);
  }, [draw, onComplete]);

  const selectNumber = (playerNumber: number) => {
    if (draw.phase !== 'choosing') {
      return;
    }

    setDraw({
      phase: 'choosing',
      selection: { playerNumber, botNumber: chooseBotNumber(playerNumber) },
    });
  };

  const startDraw = () => {
    if (draw.phase !== 'choosing' || !draw.selection) {
      return;
    }

    setDraw({ phase: 'spinning', selection: draw.selection, winner: drawFirstTurn() });
  };

  return (
    <section className="turn-draw" aria-labelledby="turn-draw-title">
      <h3 id="turn-draw-title">{t('draw.title')}</h3>
      {draw.phase === 'choosing' && (
        <>
          <p>{t('draw.choose')}</p>
          <div className="draw-numbers" role="group" aria-label={t('draw.choose')}>
            {DRAW_NUMBERS.map((number) => (
              <Button
                key={number}
                aria-pressed={draw.selection?.playerNumber === number}
                onClick={() => selectNumber(number)}
              >
                {number}
              </Button>
            ))}
          </div>
        </>
      )}
      {draw.selection && (
        <p>{t('draw.choices', draw.selection)}</p>
      )}
      {draw.phase === 'choosing' && (
        <Button disabled={!draw.selection} onClick={startDraw}>{t('draw.start')}</Button>
      )}
      {draw.phase === 'spinning' && (
        <>
          <p role="status">{t('draw.spinning')}</p>
          <div className="draw-roulette" aria-hidden="true">
            <span className="draw-roulette-player">{draw.selection.playerNumber}</span>
            <span className="draw-roulette-bot">{draw.selection.botNumber}</span>
          </div>
        </>
      )}
      {draw.phase === 'complete' && (
        <p role="status">
          {t('draw.result', {
            number: draw.winner === 'player' ? draw.selection.playerNumber : draw.selection.botNumber,
          })}{' '}
          {t(`draw.first.${draw.winner}`)}
        </p>
      )}
    </section>
  );
};
