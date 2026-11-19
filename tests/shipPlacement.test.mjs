import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { test } from 'node:test';

// Resolve the extensionless TypeScript imports used by the Vite application.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
});

const { canPositionShip, createBoardFromShips, findShipPosition, getShipCells, isFleetComplete, rotateShip } =
  await import('../src/shared/helpers/shipPlacement.ts');
const { SHIP_TYPES } = await import('../src/shared/consts.ts');

const ship = { id: 1, type: 'cruiser', row: 3, col: 3, direction: 0 };

test('four orientations and opposite rotations preserve anchor and length', () => {
  assert.deepEqual(getShipCells(ship), [{ row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 }]);
  assert.deepEqual(getShipCells(rotateShip(ship, 1)), [{ row: 3, col: 3 }, { row: 4, col: 3 }, { row: 5, col: 3 }]);
  assert.deepEqual(getShipCells(rotateShip(ship, -1)), [{ row: 3, col: 3 }, { row: 2, col: 3 }, { row: 1, col: 3 }]);
  let rotated = ship;
  for (let step = 0; step < 4; step++) rotated = rotateShip(rotated, 1);
  assert.deepEqual(rotated, ship);
  assert.deepEqual(rotateShip(rotateShip(ship, 1), -1), ship);
});

test('moves and rotations reject all borders and overlapping ships', () => {
  for (const position of [{ row: -1 }, { row: 10 }, { col: -1 }, { col: 8 }]) {
    assert.equal(canPositionShip({ ...ship, ...position }, []), false);
  }
  assert.equal(canPositionShip(rotateShip({ ...ship, row: 0 }, -1), []), false);
  assert.equal(canPositionShip(rotateShip({ ...ship, row: 9 }, 1), []), false);
  assert.equal(canPositionShip(ship, [ship]), true);
  assert.equal(canPositionShip(ship, [{ ...ship, id: 2 }]), false);
  assert.equal(canPositionShip({ ...ship, row: 4 }, [ship]), true);
});

test('fleet limits, removal, readiness and board conversion', () => {
  const ships = [];
  assert.equal(isFleetComplete(ships), false);
  for (const [type, definition] of Object.entries(SHIP_TYPES)) {
    for (let index = 0; index < definition.count; index++) {
      const next = findShipPosition(type, ships);
      assert.ok(next);
      assert.ok(canPositionShip(next, ships));
      ships.push(next);
    }
    assert.equal(findShipPosition(type, ships), null);
  }
  assert.equal(isFleetComplete(ships), true);
  const board = createBoardFromShips(ships);
  const expectedCells = Object.values(SHIP_TYPES).reduce((sum, item) => sum + item.count * item.length, 0);
  assert.equal(board.flat().filter((cell) => cell.ship).length, expectedCells);
  assert.ok(board.flat().every((cell) => !cell.hit));
  const remaining = ships.slice(1);
  assert.equal(isFleetComplete(remaining), false);
  assert.ok(findShipPosition(ships[0].type, remaining));
  assert.equal(isFleetComplete([...ships, { ...ship, id: 99 }]), false);
});

test('full board has no spawn position', () => {
  const occupied = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1, type: 'destroyer', direction: 0,
    row: Math.floor(index / 10), col: index % 10,
  }));
  assert.equal(findShipPosition('carrier', occupied), null);
});
