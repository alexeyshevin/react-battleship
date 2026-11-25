import {
  useCallback,
  useEffect,
  useId,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import type { ru } from '../../i18n/locales/ru';

import { createBoardWithShips } from '../../shared/helpers/createBoardWithShips';
import {
  chooseBotTarget,
  isJournalFleetDestroyed,
  recordShot,
  resolveShot,
} from '../../shared/helpers/shooting';
import { createEmptyBoard } from '../../shared/helpers/createEmptyBoard';
import type { Board as BoardModel, GameMode, Player } from '../../shared/types';
import { Board } from '../Board/Board';
import { GameResultDialog } from '../GameResultDialog/GameResultDialog';
import { GameStatus } from '../GameStatus/GameStatus';
import { ShipPlacement } from '../ShipPlacement/ShipPlacement';
import { TurnDraw } from '../TurnDraw/TurnDraw';
import { Button } from '../ui/Button/Button';

const BOT_SHOT_DELAY_MS = 650;

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
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [drawVersion, setDrawVersion] = useState(0);
  const handleDrawComplete = useCallback((player: Player) => {
    setFirstPlayer(player);
  }, []);
  const canStart = isPrepared && (props.mode === 'journal' || firstPlayer !== null);
  const [journalResult, setJournalResult] = useState<'hit' | 'miss'>('miss');
  const [message, setMessage] = useState<GameStatusKey>('ready');
  const isFinished = message === 'playerWins' || message === 'opponentWins';
  const isJournalActive = isStarted && props.mode === 'journal' && !isFinished;
  const canShoot = currentPlayer === 'player' && !isFinished;

  useEffect(() => {
    if (currentPlayer !== 'bot') {
      return;
    }

    const handleBotShot = () => {
      const target = chooseBotTarget(playerBoard);
      if (!target) {
        return;
      }
      const shot = resolveShot(playerBoard, target, 'bot');
      if (shot) {
        setPlayerBoard(shot.board);
        setCurrentPlayer(shot.nextPlayer);
        setMessage(shot.nextPlayer === null ? 'opponentWins' : shot.hit ? 'botHit' : 'botMiss');
      }
    };

    const timer = window.setTimeout(handleBotShot, BOT_SHOT_DELAY_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [currentPlayer, playerBoard]);

  const handleEnemyCellClick = (row: number, col: number) => {
    if (!canShoot) {
      return;
    }
    const shot = resolveShot(enemyBoard, { row, col }, 'player');
    if (shot) {
      setEnemyBoard(shot.board);
      setCurrentPlayer(shot.nextPlayer);
      setMessage(shot.nextPlayer === null ? 'playerWins' : shot.hit ? 'hit' : 'miss');
    }
  };

  const handleSelectHit = () => {
    setJournalResult('hit');
  };

  const handleSelectMiss = () => {
    setJournalResult('miss');
  };

  const handleIncomingShot = (row: number, col: number) => {
    const shot = resolveShot(playerBoard, { row, col }, 'bot');
    if (shot) {
      setPlayerBoard(shot.board);
      if (shot.nextPlayer === null) {
        setMessage('opponentWins');
      }
    }
  };

  const handleJournalShot = (row: number, col: number) => {
    const board = recordShot(enemyBoard, { row, col }, journalResult === 'hit');
    setEnemyBoard(board);
    if (board !== enemyBoard && isJournalFleetDestroyed(board)) {
      setMessage('playerWins');
    }
  };

  const opponentCellClick = isJournalActive ? handleJournalShot : canShoot ? handleEnemyCellClick : undefined;

  const handleFinishPlacement = (board: BoardModel) => {
    setPlayerBoard(board);
    setIsPrepared(true);
  };

  const handleStartGame = () => {
    if (!canStart || isStarted) {
      return;
    }

    setCurrentPlayer(firstPlayer);
    if (firstPlayer === 'bot') {
      setMessage('botTurn');
    }
    setIsStarted(true);
  };

  const handleResetGame = () => {
    setIsStarted(false);
    setIsPrepared(false);
    setFirstPlayer(null);
    setJournalResult('miss');
    setCurrentPlayer(null);
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
      {isFinished && <GameResultDialog playerWon={message === 'playerWins'} onBack={props.onBack} />}
      {isStarted && !isFinished && props.mode === 'bot' && <GameStatus message={t(`game.status.${message}`)} />}
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
      {isJournalActive && (
        <fieldset className="journal-result">
          <legend>{t('game.journalResult')}</legend>
          <label>
            <input type="radio" name={titleId} checked={journalResult === 'miss'} onChange={handleSelectMiss} />
            {t('game.journalMiss')}
          </label>
          <label>
            <input type="radio" name={titleId} checked={journalResult === 'hit'} onChange={handleSelectHit} />
            {t('game.journalHit')}
          </label>
        </fieldset>
      )}
      {isPrepared && <div className="boards">
        <Board
          title={t('game.playerBoard')}
          board={playerBoard}
          onCellClick={isJournalActive ? handleIncomingShot : undefined}
        />
        <Board
          title={t(props.mode === 'bot' ? 'game.enemyBoard' : 'game.journalBoard')}
          board={enemyBoard}
          concealShips
          onCellClick={opponentCellClick}
        />
      </div>}
    </section>
  );
};

