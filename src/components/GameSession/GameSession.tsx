import { useCallback, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ru } from '../../i18n/locales/ru';

import { createBoardWithShips } from '../../shared/helpers/createBoardWithShips';
import { createEmptyBoard } from '../../shared/helpers/createEmptyBoard';
import type { Board as BoardModel, GameMode, Player } from '../../shared/types';
import { Board } from '../Board/Board';
import { GameStatus } from '../GameStatus/GameStatus';
import { ShipPlacement } from '../ShipPlacement/ShipPlacement';
import { TurnDraw } from '../TurnDraw/TurnDraw';
import { Button } from '../ui/Button/Button';

type GameStatusKey = keyof typeof ru.game.status;

type Props = {
  mode: GameMode;
  onBack: () => void;
};

export const GameSession = (props: Props) => {
  const titleId = useId();
  const { t } = useTranslation();
  const [playerBoard, setPlayerBoard] = useState(createEmptyBoard);
  const [enemyBoard, setEnemyBoard] = useState(() => {
    return props.mode === 'bot' ? createBoardWithShips() : createEmptyBoard();
  });
  const [isPrepared, setIsPrepared] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [firstPlayer, setFirstPlayer] = useState<Player | null>(null);
  const [drawVersion, setDrawVersion] = useState(0);
  const handleDrawComplete = useCallback((player: Player) => {
    setFirstPlayer(player);
  }, []);
  const canStart = isPrepared && (props.mode === 'journal' || firstPlayer !== null);
  const canShoot = isStarted && props.mode === 'bot' && firstPlayer === 'player';
  const [message, setMessage] = useState<GameStatusKey>('ready');

  const handleEnemyCellClick = (row: number, col: number) => {
    const cell = enemyBoard[row][col];

    if (!canShoot || cell.hit) {
      return;
    }

    const updatedBoard = enemyBoard.map((boardRow) => {
      return boardRow.map((boardCell) => {
        return { ...boardCell };
      });
    });

    updatedBoard[row][col].hit = true;
    setMessage(cell.ship ? 'hit' : 'miss');
    setEnemyBoard(updatedBoard);
  };

  const handleFinishPlacement = (board: BoardModel) => {
    setPlayerBoard(board);
    setIsPrepared(true);
  };

  const handleStartGame = () => {
    if (!canStart || isStarted) {
      return;
    }

    setIsStarted(true);
  };

  const handleResetGame = () => {
    setIsStarted(false);
    setIsPrepared(false);
    setFirstPlayer(null);
    setDrawVersion((version) => {
      return version + 1;
    });
    setPlayerBoard(createEmptyBoard());
    setEnemyBoard(props.mode === 'bot' ? createBoardWithShips() : createEmptyBoard());
    setMessage('newGame');
  };

  return (
    <section aria-labelledby={titleId}>
      <h2 id={titleId} className="game-mode-title">{t(`modes.${props.mode}.title`)}</h2>
      {canShoot && <GameStatus message={t(`game.status.${message}`)} />}
      <p>{t(`modes.${props.mode}.description`)}</p>
      <div className="game-actions">
        <Button
          onClick={handleResetGame}
        >
          {t('game.reset')}
        </Button>
        <Button
          onClick={props.onBack}
        >
          {t('modes.back')}
        </Button>
      </div>
      {canStart && !isStarted && (
        <div className="game-start">
          <Button onClick={handleStartGame}>{t('game.start')}</Button>
        </div>
      )}
      {isPrepared && !isStarted && props.mode === 'bot' && (
        <TurnDraw key={drawVersion} onComplete={handleDrawComplete} />
      )}
      {!isPrepared && <ShipPlacement key={drawVersion} onReady={handleFinishPlacement} />}
      {isPrepared && <div className="boards">
        <Board
          title={t('game.playerBoard')}
          board={playerBoard}
        />
        <Board
          title={t(props.mode === 'bot' ? 'game.enemyBoard' : 'game.journalBoard')}
          board={enemyBoard}
          concealShips
          onCellClick={canShoot ? handleEnemyCellClick : undefined}
        />
      </div>}
    </section>
  );
};

