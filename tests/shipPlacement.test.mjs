import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { test } from 'node:test';

// Resolve the extensionless TypeScript imports used by the Vite application.
registerHooks({
  resolve: (specifier, context, nextResolve) => {
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
});

const { canPositionShip, createBoardFromShips, findShipPosition, getShipCells, isFleetComplete, randomizeFleet, rotateShip } =
  await import('../src/shared/helpers/shipPlacement.ts');
const { SHIP_TYPES, SIZE } = await import('../src/shared/consts.ts');

const ship = { id: 1, type: 'cruiser', row: 3, col: 3, direction: 0 };

test('four orientations and opposite rotations preserve anchor and length', () => {
  assert.deepEqual(getShipCells(ship), [{ row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 }]);
  assert.deepEqual(getShipCells(rotateShip(ship, 1)), [{ row: 3, col: 3 }, { row: 4, col: 3 }, { row: 5, col: 3 }]);
  assert.deepEqual(getShipCells(rotateShip(ship, -1)), [{ row: 3, col: 3 }, { row: 2, col: 3 }, { row: 1, col: 3 }]);
  let rotated = ship;
  for (let step = 0; step < 4; step++) {
    rotated = rotateShip(rotated, 1);
  }
  assert.deepEqual(rotated, ship);
  assert.deepEqual(rotateShip(rotateShip(ship, 1), -1), ship);
});

test('moves and rotations reject all borders and overlapping ships', () => {
  const rightmostAnchor = SIZE - SHIP_TYPES[ship.type].length;
  for (const position of [{ row: -1 }, { row: SIZE }, { col: -1 }, { col: rightmostAnchor + 1 }]) {
    assert.equal(canPositionShip({ ...ship, ...position }, []), false);
  }
  assert.equal(canPositionShip(rotateShip({ ...ship, row: 0 }, -1), []), false);
  assert.equal(canPositionShip(rotateShip({ ...ship, row: SIZE - 1 }, 1), []), false);
  assert.equal(canPositionShip(ship, [ship]), true);
  assert.equal(canPositionShip(ship, [{ ...ship, id: 2 }]), false);
});

test('ships need one empty cell between them, including diagonally', () => {
  const other = { ...ship, id: 2 };
  assert.equal(canPositionShip({ ...other, row: 4 }, [ship]), false);
  assert.equal(canPositionShip({ ...other, col: 6 }, [ship]), false);
  assert.equal(canPositionShip({ ...other, row: 4, col: 6 }, [ship]), false);
  assert.equal(canPositionShip({ ...other, row: 5 }, [ship]), true);
  assert.equal(canPositionShip({ ...other, col: 7 }, [ship]), true);

  const candidate = { ...other, row: 1 };
  assert.equal(canPositionShip(candidate, [ship, candidate]), true);
  assert.equal(canPositionShip(rotateShip(candidate, 1), [ship, candidate]), false);
});

test('randomization produces complete fleets separated on all sides', () => {
  const previous = randomizeFleet([]);
  const ships = randomizeFleet(previous);
  assert.ok(isFleetComplete(previous));
  assert.ok(isFleetComplete(ships));
  assert.notDeepEqual(createBoardFromShips(ships), createBoardFromShips(previous));

  for (const [index, ship] of ships.entries()) {
    for (const other of ships.slice(index + 1)) {
      for (const cell of getShipCells(ship)) {
        for (const neighbor of getShipCells(other)) {
          assert.ok(Math.abs(cell.row - neighbor.row) > 1 || Math.abs(cell.col - neighbor.col) > 1);
        }
      }
    }
  }
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
  const expectedCells = Object.values(SHIP_TYPES).reduce((sum, item) => {
    return sum + item.count * item.length;
  }, 0);
  const cells = board.flat();
  const shipCells = cells.filter((cell) => {
    return cell.ship;
  });
  assert.equal(shipCells.length, expectedCells);
  assert.ok(cells.every((cell) => {
    return !cell.hit;
  }));
  const remaining = ships.slice(1);
  assert.equal(isFleetComplete(remaining), false);
  assert.ok(findShipPosition(ships[0].type, remaining));
  assert.equal(isFleetComplete([...ships, { ...ship, id: 99 }]), false);
});

test('manual placement uses the first free anchor and prefers horizontal placement', () => {
  const type = 'cruiser';
  assert.deepEqual(findShipPosition(type, []), { id: 1, type, row: 0, col: 0, direction: 0 });

  const blocker = { id: 1, type: 'destroyer', row: 0, col: 2, direction: 0 };
  assert.deepEqual(findShipPosition(type, [blocker]), { id: 2, type, row: 0, col: 0, direction: 1 });

  const cornerBlocker = { ...blocker, col: 0 };
  assert.deepEqual(findShipPosition(type, [cornerBlocker]), { id: 2, type, row: 0, col: 3, direction: 0 });
});

test('full board has no spawn position', () => {
  const occupied = Array.from({ length: SIZE ** 2 }, (_, index) => {
    return {
      id: index + 1, type: 'destroyer', direction: 0,
      row: Math.floor(index / SIZE), col: index % SIZE,
    };
  });
  assert.equal(findShipPosition('carrier', occupied), null);
});
