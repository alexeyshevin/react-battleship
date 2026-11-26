import { useEffect, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button/Button';
import './GameResultDialog.css';

type Props = {
  playerWon: boolean;
  onUndoEntry?: () => void;
  onBack: () => void;
};

export const GameResultDialog = (props: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const { t } = useTranslation();

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
    };
  }, []);

  return (
    <dialog ref={dialogRef} className="game-result" aria-labelledby={titleId}
      aria-describedby={descriptionId} onCancel={props.onBack}>
      <h2 id={titleId}>{t(props.playerWon ? 'game.status.playerWins' : 'game.status.opponentWins')}</h2>
      <p id={descriptionId}>{t(props.playerWon ? 'game.result.enemySunk' : 'game.result.fleetLost')}</p>
      <div className="game-actions">
        {props.onUndoEntry && <Button onClick={props.onUndoEntry}>{t('game.undoEntry')}</Button>}
        <Button onClick={props.onBack}>{t('modes.back')}</Button>
      </div>
    </dialog>
  );
};
