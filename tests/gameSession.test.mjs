import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SHIP_TYPES } from '../src/shared/consts.ts';
import { createGameState, gameReducer } from '../src/shared/helpers/gameSession.ts';

const makeBoard = (...ships) => {
  return [ships.map((ship) => {
    return { ship, hit: false };
  })];
};

const prepare = (mode) => {
  const initial = createGameState(mode, {
    playerBoard: makeBoard(false, false),
    enemyBoard: makeBoard(true, false, true),
  });
  assert.equal(gameReducer(initial, { type: 'start' }), initial);
  return gameReducer(initial, { type: 'place', board: makeBoard(true, false) });
};

const startBattle = (firstPlayer) => {
  const draw = prepare('bot');
  assert.equal(draw.phase.kind, 'draw');
  assert.equal(gameReducer(draw, { type: 'start' }), draw);
  const ready = gameReducer(draw, { type: 'draw', firstPlayer });
  assert.equal(ready.phase.kind, 'ready');
  return gameReducer(ready, { type: 'start' });
};

const shoot = (shooter, col) => {
  return { type: 'shoot', shooter, target: { row: 0, col } };
};

test('battle enforces the turn, repeats on hit, passes on miss and ends on the final hit', () => {
  const started = startBattle('player');
  assert.equal(gameReducer(started, shoot('bot', 0)), started);
  const hit = gameReducer(started, shoot('player', 0));
  assert.deepEqual(hit.phase, { kind: 'battle', currentPlayer: 'player', message: 'hit' });
  assert.equal(gameReducer(hit, shoot('player', 0)), hit);
  const miss = gameReducer(hit, shoot('player', 1));
  assert.equal(miss.phase.currentPlayer, 'bot');
  const botMiss = gameReducer(miss, shoot('bot', 1));
  assert.equal(botMiss.phase.currentPlayer, 'player');
  const finished = gameReducer(botMiss, shoot('player', 2));
  assert.deepEqual(finished.phase, { kind: 'finished', winner: 'player' });
  assert.equal(gameReducer(finished, shoot('bot', 0)), finished);
  assert.equal(gameReducer(finished, { type: 'undo' }), finished);
});

test('reset during the bot turn ignores the pending shot and requires placement and a new draw', () => {
  const battle = startBattle('bot');
  const boards = { playerBoard: makeBoard(false), enemyBoard: makeBoard(true) };
  const reset = gameReducer(battle, { type: 'reset', boards });
  assert.equal(reset.phase.kind, 'placement');
  assert.equal(reset.round, battle.round + 1);
  assert.equal(gameReducer(reset, shoot('bot', 0)), reset);
  assert.equal(reset.playerBoard[0][0].hit, false);
  const placed = gameReducer(reset, { type: 'place', board: makeBoard(true) });
  assert.equal(placed.phase.kind, 'draw');
  assert.equal(gameReducer(placed, { type: 'start' }), placed);
});

test('journal starts without a draw and undo restores the last entry across both boards', () => {
  const ready = prepare('journal');
  assert.equal(ready.phase.kind, 'ready');
  const journal = gameReducer(ready, { type: 'start' });
  assert.equal(journal.phase.kind, 'journal');
  const logged = gameReducer(journal, { type: 'outgoing', target: { row: 0, col: 1 }, hit: false });
  const lost = gameReducer(logged, { type: 'incoming', target: { row: 0, col: 0 } });
  assert.deepEqual(lost.phase, { kind: 'finished', winner: 'opponent' });
  const restored = gameReducer(lost, { type: 'undo' });
  assert.equal(restored.phase.kind, 'journal');
  assert.equal(restored.playerBoard, journal.playerBoard);
  assert.equal(restored.enemyBoard, logged.enemyBoard);
  assert.equal(gameReducer(restored, { type: 'undo' }), restored);
  const reset = gameReducer(lost, { type: 'reset', boards: { playerBoard: makeBoard(false), enemyBoard: makeBoard(false) } });
  assert.equal(gameReducer(reset, { type: 'undo' }), reset);
});

test('undoing the final reported hit reopens the journal for a corrected entry', () => {
  const decks = Object.values(SHIP_TYPES).reduce((sum, ship) => {
    return sum + ship.length * ship.count;
  }, 0);
  const ready = gameReducer(createGameState('journal', {
    playerBoard: makeBoard(false),
    enemyBoard: makeBoard(...Array(decks).fill(false)),
  }), { type: 'place', board: makeBoard(true) });
  let journal = gameReducer(ready, { type: 'start' });
  for (let col = 0; col < decks - 1; col++) {
    journal = gameReducer(journal, { type: 'outgoing', target: { row: 0, col }, hit: true });
  }
  const last = { type: 'outgoing', target: { row: 0, col: decks - 1 }, hit: true };
  const won = gameReducer(journal, last);
  assert.deepEqual(won.phase, { kind: 'finished', winner: 'player' });
  const undone = gameReducer(won, { type: 'undo' });
  assert.equal(undone.enemyBoard, journal.enemyBoard);
  const corrected = gameReducer(undone, { ...last, hit: false });
  assert.equal(corrected.phase.kind, 'journal');
  assert.deepEqual(corrected.enemyBoard[0][decks - 1], { hit: true, ship: false });
  assert.equal(gameReducer(corrected, last), corrected);
});
