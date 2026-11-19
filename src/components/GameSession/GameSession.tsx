import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ru } from '../../i18n/locales/ru';

import { createBoardWithShips } from '../../shared/helpers/createBoardWithShips';
import { createEmptyBoard } from '../../shared/helpers/createEmptyBoard';
import type { Board as BoardModel, GameMode, Player } from '../../shared/types';
import { ShipPlacement } from '../ShipPlacement/ShipPlacement';
import { TurnDraw } from '../TurnDraw/TurnDraw';
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
  const [playerBoard, setPlayerBoard] = useState(createEmptyBoard);
  const [enemyBoard, setEnemyBoard] = useState(
    () => props.mode === 'bot' ?
      createBoardWithShips() :
      createEmptyBoard(),
  );
  const [isPrepared, setIsPrepared] = useState(false);
  const [firstPlayer, setFirstPlayer] = useState<Player | null>(null);
  const [drawVersion, setDrawVersion] = useState(0);
  const handleDrawComplete = useCallback((player: Player) => setFirstPlayer(player), []);
  const canShoot = isPrepared && props.mode === 'bot' && firstPlayer === 'player';
  const [message, setMessage] = useState<GameStatusKey>('ready');

  function handleEnemyCellClick(row: number, col: number) {
    const cell = enemyBoard[row][col];

    if (!canShoot || cell.hit) {
      return;
    }

    const updatedBoard = enemyBoard.map((boardRow) =>
      boardRow.map((cell) => ({ ...cell })),
    );

    updatedBoard[row][col].hit = true;
    setMessage(cell.ship ? 'hit' : 'miss');
    setEnemyBoard(updatedBoard);
  }

  function finishPlacement(board: BoardModel) {
    setPlayerBoard(board);
    setIsPrepared(true);
  }

  function resetGame() {
    setIsPrepared(false);
    setFirstPlayer(null);
    setDrawVersion((version) => version + 1);
    setPlayerBoard(createEmptyBoard());
    setEnemyBoard(props.mode === 'bot' ? createBoardWithShips() : createEmptyBoard());
    setMessage('newGame');
  }

  return (
    <section aria-labelledby="game-mode-title">
      <h2 id="game-mode-title">{t(`modes.${props.mode}.title`)}</h2>
      {canShoot && <GameStatus message={t(`game.status.${message}`)} />}
      <p>{t(`modes.${props.mode}.description`)}</p>
      {isPrepared && props.mode === 'bot' && (
        <TurnDraw key={drawVersion} onComplete={handleDrawComplete} />
      )}
      <div className="game-actions">
        <Button onClick={resetGame}>{t('game.reset')}</Button>
        <Button onClick={props.onBack}>{t('modes.back')}</Button>
      </div>
      {!isPrepared && <ShipPlacement key={drawVersion} onReady={finishPlacement} />}
      {isPrepared && <div className="boards">
        <Board title={t('game.playerBoard')} board={playerBoard} />
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

