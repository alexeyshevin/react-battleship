import type {
  Board,
  Coordinates,
  GameMode,
  Player,
} from '../types';
import { isJournalFleetDestroyed, recordShot, resolveShot } from './shooting.ts';

type Boards = { playerBoard: Board; enemyBoard: Board };
type Phase =
  | { kind: 'placement' | 'draw' }
  | { kind: 'ready'; firstPlayer: Player | null }
  | { kind: 'battle'; currentPlayer: Player; message: 'ready' | 'newGame' | 'botTurn' | 'hit' | 'miss' | 'botHit' | 'botMiss' }
  | { kind: 'journal' }
  | { kind: 'finished'; winner: 'player' | 'opponent' };

type GameState = Boards & {
  mode: GameMode;
  phase: Phase;
  beforeLastEntry: Boards | null;
  round: number;
};

type GameAction =
  | { type: 'reset'; boards: Boards }
  | { type: 'place'; board: Board }
  | { type: 'draw'; firstPlayer: Player }
  | { type: 'start' | 'undo' }
  | { type: 'shoot'; shooter: Player; target: Coordinates }
  | { type: 'incoming'; target: Coordinates }
  | { type: 'outgoing'; target: Coordinates; hit: boolean };

export const createGameState = (mode: GameMode, boards: Boards, round = 0): GameState => {
  return { ...boards, mode, round, phase: { kind: 'placement' }, beforeLastEntry: null };
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  const { phase, playerBoard, enemyBoard } = state;
  switch (action.type) {
    case 'reset':
      return createGameState(state.mode, action.boards, state.round + 1);
    case 'place':
      if (phase.kind !== 'placement') {
        return state;
      }
      return {
        ...state,
        playerBoard: action.board,
        phase: state.mode === 'bot' ? { kind: 'draw' } : { kind: 'ready', firstPlayer: null },
      };
    case 'draw':
      if (phase.kind !== 'draw') {
        return state;
      }
      return { ...state, phase: { kind: 'ready', firstPlayer: action.firstPlayer } };
    case 'start': {
      if (phase.kind !== 'ready') {
        return state;
      }
      if (!phase.firstPlayer) {
        return { ...state, phase: { kind: 'journal' } };
      }
      const message = phase.firstPlayer === 'bot' ? 'botTurn' : state.round ? 'newGame' : 'ready';
      return { ...state, phase: { kind: 'battle', currentPlayer: phase.firstPlayer, message } };
    }
    case 'shoot': {
      if (phase.kind !== 'battle' || phase.currentPlayer !== action.shooter) {
        return state;
      }
      const isPlayer = action.shooter === 'player';
      const shot = resolveShot(isPlayer ? enemyBoard : playerBoard, action.target, action.shooter);
      if (!shot) {
        return state;
      }
      const boardKey = isPlayer ? 'enemyBoard' : 'playerBoard';
      if (shot.nextPlayer === null) {
        return {
          ...state,
          [boardKey]: shot.board,
          phase: { kind: 'finished', winner: isPlayer ? 'player' : 'opponent' },
        };
      }
      const message = isPlayer ? (shot.hit ? 'hit' : 'miss') : (shot.hit ? 'botHit' : 'botMiss');
      return {
        ...state,
        [boardKey]: shot.board,
        phase: { kind: 'battle', currentPlayer: shot.nextPlayer, message },
      };
    }
    case 'incoming':
    case 'outgoing': {
      if (phase.kind !== 'journal') {
        return state;
      }
      const beforeLastEntry = { playerBoard, enemyBoard };
      if (action.type === 'incoming') {
        const shot = resolveShot(playerBoard, action.target, 'bot');
        if (!shot) {
          return state;
        }
        return {
          ...state,
          beforeLastEntry,
          playerBoard: shot.board,
          phase: shot.nextPlayer === null ? { kind: 'finished', winner: 'opponent' } : phase,
        };
      }
      const board = recordShot(enemyBoard, action.target, action.hit);
      if (board === enemyBoard) {
        return state;
      }
      return {
        ...state,
        beforeLastEntry,
        enemyBoard: board,
        phase: isJournalFleetDestroyed(board) ? { kind: 'finished', winner: 'player' } : phase,
      };
    }
    case 'undo':
      if (!state.beforeLastEntry) {
        return state;
      }
      return { ...state, ...state.beforeLastEntry, beforeLastEntry: null, phase: { kind: 'journal' } };
  }
};
