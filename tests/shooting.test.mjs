import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chooseBotTarget, resolveShot } from '../src/shared/helpers/shooting.ts';

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
