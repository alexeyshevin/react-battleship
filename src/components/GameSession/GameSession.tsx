import {
  useCallback,
  useEffect,
  useId,
  useState,
  useReducer,
} from 'react';
import { useTranslation } from 'react-i18next';
import { createGameState, gameReducer } from '../../shared/helpers/gameSession';

import { createBoardWithShips } from '../../shared/helpers/createBoardWithShips';
import { chooseBotTarget } from '../../shared/helpers/shooting';
import { createEmptyBoard } from '../../shared/helpers/createEmptyBoard';
import type { Board as BoardModel, GameMode, Player } from '../../shared/types';
import { Board } from '../Board/Board';
import { GameResultDialog } from '../GameResultDialog/GameResultDialog';
import { GameStatus } from '../GameStatus/GameStatus';
import { ShipPlacement } from '../ShipPlacement/ShipPlacement';
import { TurnDraw } from '../TurnDraw/TurnDraw';
import { Button } from '../ui/Button/Button';

const BOT_SHOT_DELAY_MS = 650;

const createBoards = (mode: GameMode) => {
  return {
    playerBoard: createEmptyBoard(),
    enemyBoard: mode === 'bot' ? createBoardWithShips() : createEmptyBoard(),
  };
};

const initializeGame = (mode: GameMode) => {
  return createGameState(mode, createBoards(mode));
};

type Props = {
  mode: GameMode;
  onBack: () => void;
};

export const GameSession = (props: Props) => {
  const titleId = useId();
  const { t } = useTranslation();
  const [game, dispatch] = useReducer(gameReducer, props.mode, initializeGame);
  const [journalResult, setJournalResult] = useState<'hit' | 'miss'>('miss');
  const { phase, playerBoard, enemyBoard, beforeLastEntry } = game;
  const isJournalActive = phase.kind === 'journal';
  const canShoot = phase.kind === 'battle' && phase.currentPlayer === 'player';
  const isBotTurn = phase.kind === 'battle' && phase.currentPlayer === 'bot';

  useEffect(() => {
    if (!isBotTurn) {
      return;
    }
    const handleBotShot = () => {
      const target = chooseBotTarget(playerBoard);
      if (target) {
        dispatch({ type: 'shoot', shooter: 'bot', target });
      }
    };
    const timer = window.setTimeout(handleBotShot, BOT_SHOT_DELAY_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [isBotTurn, playerBoard]);

  const handleDrawComplete = useCallback((firstPlayer: Player) => {
    dispatch({ type: 'draw', firstPlayer });
  }, []);

  const handleEnemyCellClick = (row: number, col: number) => {
    dispatch({ type: 'shoot', shooter: 'player', target: { row, col } });
  };
  const handleSelectHit = () => {
    setJournalResult('hit');
  };
  const handleSelectMiss = () => {
    setJournalResult('miss');
  };
  const handleUndoEntry = () => {
    dispatch({ type: 'undo' });
  };
  const handleIncomingShot = (row: number, col: number) => {
    dispatch({ type: 'incoming', target: { row, col } });
  };
  const handleJournalShot = (row: number, col: number) => {
    dispatch({ type: 'outgoing', target: { row, col }, hit: journalResult === 'hit' });
  };
  const opponentCellClick = isJournalActive ? handleJournalShot : canShoot ? handleEnemyCellClick : undefined;

  const handleFinishPlacement = (board: BoardModel) => {
    dispatch({ type: 'place', board });
  };
  const handleStartGame = () => {
    dispatch({ type: 'start' });
  };
  const handleResetGame = () => {
    setJournalResult('miss');
    dispatch({ type: 'reset', boards: createBoards(props.mode) });
  };
  const showDraw = props.mode === 'bot' && (phase.kind === 'draw' || phase.kind === 'ready');

  return (
    <section aria-labelledby={titleId}>
      <h2 id={titleId} className="game-mode-title">{t(`modes.${props.mode}.title`)}</h2>
      {phase.kind === 'finished' && (
        <GameResultDialog
          playerWon={phase.winner === 'player'}
          onBack={props.onBack}
          onUndoEntry={beforeLastEntry ? handleUndoEntry : undefined}
        />
      )}
      {phase.kind === 'battle' && <GameStatus message={t(`game.status.${phase.message}`)} />}
      <p>{t(`modes.${props.mode}.description`)}</p>
      <div className="game-actions">
        {isJournalActive && (
          <Button disabled={!beforeLastEntry} onClick={handleUndoEntry}>
            {t('game.undoEntry')}
          </Button>
        )}
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
      {phase.kind === 'ready' && (
        <div className="game-start">
          <Button onClick={handleStartGame}>{t('game.start')}</Button>
        </div>
      )}
      {showDraw && (
        <TurnDraw key={game.round} onComplete={handleDrawComplete} />
      )}
      {phase.kind === 'placement' && <ShipPlacement key={game.round} onReady={handleFinishPlacement} />}
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
      {phase.kind !== 'placement' && <div className="boards">
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

