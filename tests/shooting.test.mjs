import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chooseBotTarget, recordShot, resolveShot } from '../src/shared/helpers/shooting.ts';

for (const shooter of ['bot', 'player']) {
  test(`${shooter} keeps the turn on a hit and passes it on a miss`, () => {
    const board = [[
      { ship: true, hit: false },
      { ship: true, hit: false },
      { ship: false, hit: false },
    ]];
    const firstTarget = { row: 0, col: 0 };
    const hit = resolveShot(board, firstTarget, shooter);
    assert.equal(hit.nextPlayer, shooter);
    assert.equal(board[0][0].hit, false);
    assert.equal(resolveShot(hit.board, firstTarget, shooter), undefined);
    const miss = resolveShot(hit.board, { row: 0, col: 2 }, shooter);
    assert.equal(miss.nextPlayer, shooter === 'bot' ? 'player' : 'bot');
    const target = chooseBotTarget(miss.board);
    assert.deepEqual(target, { row: 0, col: 1 });
    const finalShot = resolveShot(miss.board, target, shooter);
    assert.equal(finalShot.nextPlayer, null);
    assert.equal(chooseBotTarget(finalShot.board), undefined);
  });
}

test('journal records incoming shots against the fleet and outgoing shots as reported', () => {
  const water = { ship: false, hit: false };
  const ship = { ship: true, hit: false };
  const first = { row: 0, col: 0 };
  const second = { row: 0, col: 1 };
  const home = recordShot(recordShot([[water, ship]], first), second);
  assert.deepEqual(home[0], [{ ship: false, hit: true }, { ship: true, hit: true }]);

  const log = recordShot(recordShot([[water, water]], first, true), second, false);
  assert.deepEqual(log[0], [{ ship: true, hit: true }, { ship: false, hit: true }]);
  assert.equal(recordShot(log, first, false), log);
  assert.equal(water.hit, false);
});
