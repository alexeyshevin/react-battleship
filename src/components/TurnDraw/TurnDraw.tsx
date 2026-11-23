import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  chooseBotNumber,
  DRAW_DURATION_MS,
  DRAW_NUMBERS,
  drawFirstTurn,
} from '../../shared/helpers/drawFirstTurn';
import type { DrawState, Player } from '../../shared/types';
import { Button } from '../ui/Button/Button';
import './TurnDraw.css';

type Props = {
  onComplete: (firstPlayer: Player) => void;
};

export const TurnDraw = (props: Props) => {
  const { t } = useTranslation();
  const [draw, setDraw] = useState<DrawState>({ phase: 'choosing', selection: null });
  const [secondsRemaining, setSecondsRemaining] = useState(DRAW_DURATION_MS / 1000);
  const onComplete = props.onComplete;

  useEffect(() => {
    if (draw.phase !== 'spinning') {
      return;
    }

    const deadline = performance.now() + DRAW_DURATION_MS;
    const interval = window.setInterval(() => {
      const remaining = Math.max(0, deadline - performance.now());
      setSecondsRemaining(Math.ceil(remaining / 1000));
    }, 100);

    const timeout = window.setTimeout(() => {
      setDraw({ ...draw, phase: 'complete' });
      onComplete(draw.winner);
    }, DRAW_DURATION_MS);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [draw, onComplete]);

  const handleSelectNumber = (playerNumber: number) => {
    if (draw.phase !== 'choosing') {
      return;
    }

    setDraw({
      phase: 'choosing',
      selection: { playerNumber, botNumber: chooseBotNumber(playerNumber) },
    });
  };

  const handleStartDraw = () => {
    if (draw.phase !== 'choosing' || !draw.selection) {
      return;
    }

    setSecondsRemaining(DRAW_DURATION_MS / 1000);

    setDraw({ phase: 'spinning', selection: draw.selection, winner: drawFirstTurn() });
  };

  const renderNumber = (number: number) => {
    const handleClick = () => handleSelectNumber(number);

    return (
      <Button
        key={number}
        aria-pressed={draw.selection?.playerNumber === number}
        onClick={handleClick}
      >
        {number}
      </Button>
    );
  };

  return (
    <section className="turn-draw" aria-labelledby="turn-draw-title">
      <h3 id="turn-draw-title">{t('draw.title')}</h3>
      {draw.phase === 'choosing' && (
        <>
          <p>{t('draw.choose')}</p>
          <div className="draw-numbers" role="group" aria-label={t('draw.choose')}>
            {DRAW_NUMBERS.map(renderNumber)}
          </div>
        </>
      )}
      {draw.selection && (
        <p>{t('draw.choices', draw.selection)}</p>
      )}
      {draw.phase === 'choosing' && (
        <Button disabled={!draw.selection} onClick={handleStartDraw}>{t('draw.start')}</Button>
      )}
      {draw.phase === 'spinning' && (
        <>
          <p role="status">{t('draw.spinning')}</p>
          <p className="draw-countdown" role="timer" aria-live="off">
            {t('draw.countdown', { seconds: secondsRemaining })}
          </p>
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
