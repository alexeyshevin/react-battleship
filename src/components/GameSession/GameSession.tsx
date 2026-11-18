import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ru } from '../../i18n/locales/ru';

import { createBoardWithShips } from '../../shared/helpers/createBoardWithShips';
import { createEmptyBoard } from '../../shared/helpers/createEmptyBoard';
import type { GameMode } from '../../shared/types';
import { Board } from '../Board/Board';
import { GameStatus } from '../GameStatus/GameStatus';
import { Button } from '../ui/Button/Button';

type GameStatusKey = keyof typeof ru.game.status;

type Props = {
  mode: GameMode;
  onBack: () => void;
};

export const GameSession = (props: Props) => {
  const { t } = useTranslation();
  const [playerBoard, setPlayerBoard] = useState(createBoardWithShips);
  const [enemyBoard, setEnemyBoard] = useState(
    () => props.mode === 'bot' ?
      createBoardWithShips() :
      createEmptyBoard()
  );
  const [message, setMessage] = useState<GameStatusKey>('ready');

  function handleEnemyCellClick(row: number, col: number) {
    const cell = enemyBoard[row][col];

    if (cell.hit) {
      return;
    }

    const updatedBoard = enemyBoard.map((boardRow) =>
      boardRow.map((cell) => ({ ...cell })),
    );

    updatedBoard[row][col].hit = true;
    setMessage(cell.ship ? 'hit' : 'miss');
    setEnemyBoard(updatedBoard);
  }

  function resetGame() {
    setPlayerBoard(createBoardWithShips());
    setEnemyBoard(props.mode === 'bot' ? createBoardWithShips() : createEmptyBoard());
    setMessage('newGame');
  }

  return (
    <section aria-labelledby="game-mode-title">
      <h2 id="game-mode-title">{t(`modes.${props.mode}.title`)}</h2>
      {props.mode === 'bot' && <GameStatus message={t(`game.status.${message}`)} />}
      <p>{t(`modes.${props.mode}.description`)}</p>
      <div className="game-actions">
        <Button onClick={resetGame}>{t('game.reset')}</Button>
        <Button onClick={props.onBack}>{t('modes.back')}</Button>
      </div>
      <div className="boards">
        <Board title={t('game.playerBoard')} board={playerBoard} />
        <Board
          title={t(props.mode === 'bot' ? 'game.enemyBoard' : 'game.journalBoard')}
          board={enemyBoard}
          concealShips
          onCellClick={props.mode === 'bot' ? handleEnemyCellClick : undefined}
        />
      </div>
    </section>
  );
};

