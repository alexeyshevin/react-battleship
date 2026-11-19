import { SHIP_TYPES, SIZE } from '../consts';
import type { Coordinates, Direction, PlacedShip, ShipType } from '../types';
import { createEmptyBoard } from './createEmptyBoard';

const vectors: Coordinates[] = [
  { row: 0, col: 1 }, { row: 1, col: 0 },
  { row: 0, col: -1 }, { row: -1, col: 0 },
];

export const getShipCells = (ship: PlacedShip): Coordinates[] => {
  const vector = vectors[ship.direction];
  return Array.from({ length: SHIP_TYPES[ship.type].length }, (_, index) => ({
    row: ship.row + vector.row * index,
    col: ship.col + vector.col * index,
  }));
};

export const canPositionShip = (ship: PlacedShip, ships: readonly PlacedShip[]): boolean => {
  const occupied = new Set(ships.filter((other) => other.id !== ship.id)
    .flatMap(getShipCells).map(({ row, col }) => `${row}:${col}`));
  return getShipCells(ship).every(({ row, col }) =>
    row >= 0 && row < SIZE && col >= 0 && col < SIZE && !occupied.has(`${row}:${col}`),
  );
};

export const findShipPosition = (type: ShipType, ships: readonly PlacedShip[]): PlacedShip | null => {
  if (ships.filter((ship) => ship.type === type).length >= SHIP_TYPES[type].count) {
    return null;
  }
  const id = Math.max(0, ...ships.map((ship) => ship.id)) + 1;
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      for (const direction of [0, 1] as const) {
        const ship = { id, type, row, col, direction };
        if (canPositionShip(ship, ships)) return ship;
      }
    }
  }
  return null;
};

export const rotateShip = (ship: PlacedShip, step: -1 | 1): PlacedShip => ({
  ...ship, direction: ((ship.direction + step + 4) % 4) as Direction,
});

export const isFleetComplete = (ships: readonly PlacedShip[]): boolean =>
  Object.entries(SHIP_TYPES).every(([type, definition]) =>
    ships.filter((ship) => ship.type === type).length === definition.count,
  ) && ships.every((ship) => canPositionShip(ship, ships));

export const createBoardFromShips = (ships: readonly PlacedShip[]) => {
  const board = createEmptyBoard();
  ships.flatMap(getShipCells).forEach(({ row, col }) => { board[row][col].ship = true; });
  return board;
};
