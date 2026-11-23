import { SHIP_TYPES, SIZE } from '../consts';
import type { Coordinates, Direction, PlacedShip, ShipType } from '../types';
import { createEmptyBoard } from './createEmptyBoard';

const vectors: Coordinates[] = [
  { row: 0, col: 1 }, { row: 1, col: 0 },
  { row: 0, col: -1 }, { row: -1, col: 0 },
];
const SHIP_CLEARANCE = 1;

export const getShipCells = (ship: PlacedShip): Coordinates[] => {
  const vector = vectors[ship.direction];
  return Array.from({ length: SHIP_TYPES[ship.type].length }, (_, index) => ({
    row: ship.row + vector.row * index,
    col: ship.col + vector.col * index,
  }));
};

const getBlockedCells = (ships: readonly PlacedShip[]): Set<string> => {
  const blocked = new Set<string>();
  for (const { row, col } of ships.flatMap(getShipCells)) {
    for (let rowOffset = -SHIP_CLEARANCE; rowOffset <= SHIP_CLEARANCE; rowOffset++) {
      for (let colOffset = -SHIP_CLEARANCE; colOffset <= SHIP_CLEARANCE; colOffset++) {
        blocked.add(`${row + rowOffset}:${col + colOffset}`);
      }
    }
  }
  return blocked;
};

const canOccupyCells = (ship: PlacedShip, blocked: ReadonlySet<string>): boolean => {
  return getShipCells(ship).every(({ row, col }) => {
    return row >= 0 && row < SIZE && col >= 0 && col < SIZE && !blocked.has(`${row}:${col}`);
  });
};

export const canPositionShip = (ship: PlacedShip, ships: readonly PlacedShip[]): boolean => {
  const otherShips = ships.filter((other) => {
    return other.id !== ship.id;
  });
  return canOccupyCells(ship, getBlockedCells(otherShips));
};

export const findShipPosition = (type: ShipType, ships: readonly PlacedShip[]): PlacedShip | null => {
  if (ships.filter((ship) => ship.type === type).length >= SHIP_TYPES[type].count) {
    return null;
  }
  const id = Math.max(0, ...ships.map((ship) => ship.id)) + 1;
  const blocked = getBlockedCells(ships);
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      for (const direction of [0, 1] as const) {
        const ship = { id, type, row, col, direction };
        if (canOccupyCells(ship, blocked)) return ship;
      }
    }
  }
  return null;
};

const fleetTypes = (Object.keys(SHIP_TYPES) as ShipType[]).flatMap((type) =>
  Array.from({ length: SHIP_TYPES[type].count }, () => type),
);

export const randomizeFleet = (previousShips: readonly PlacedShip[]): PlacedShip[] => {
  const previousBoard = createBoardFromShips(previousShips);
  const ships: PlacedShip[] = [];

  const placeNextShip = (): boolean => {
    if (ships.length === fleetTypes.length) {
      return previousShips.length !== ships.length || ships.some((ship) =>
        getShipCells(ship).some(({ row, col }) => !previousBoard[row][col].ship),
      );
    }

    const type = fleetTypes[ships.length];
    const id = ships.length + 1;
    const candidates: PlacedShip[] = [];
    const blocked = getBlockedCells(ships);

    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        for (const direction of [0, 1] as const) {
          const ship = { id, type, row, col, direction };
          if (canOccupyCells(ship, blocked)) {
            candidates.push(ship);
          }
        }
      }
    }

    while (candidates.length > 0) {
      const index = Math.floor(Math.random() * candidates.length);
      const candidate = candidates[index];
      candidates[index] = candidates[candidates.length - 1];
      candidates.pop();

      ships.push(candidate);
      if (placeNextShip()) {
        return true;
      }
      ships.pop();
    }

    return false;
  };

  placeNextShip();
  return ships;
};

export const rotateShip = (ship: PlacedShip, step: -1 | 1): PlacedShip => ({
  ...ship, direction: ((ship.direction + step + 4) % 4) as Direction,
});

export const isFleetComplete = (ships: readonly PlacedShip[]): boolean =>
  new Set(ships.map((ship) => ship.id)).size === ships.length &&
  Object.entries(SHIP_TYPES).every(([type, definition]) =>
    ships.filter((ship) => ship.type === type).length === definition.count,
  ) && ships.every((ship) => canPositionShip(ship, ships));

export const createBoardFromShips = (ships: readonly PlacedShip[]) => {
  const board = createEmptyBoard();
  ships.flatMap(getShipCells).forEach(({ row, col }) => { board[row][col].ship = true; });
  return board;
};
