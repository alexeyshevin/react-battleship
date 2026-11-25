import { SHIP_TYPES, SIZE } from '../consts';
import type {
  Coordinates,
  Direction,
  PlacedShip,
  ShipType,
} from '../types';
import { createEmptyBoard } from './createEmptyBoard';

const vectors: Coordinates[] = [
  { row: 0, col: 1 }, { row: 1, col: 0 },
  { row: 0, col: -1 }, { row: -1, col: 0 },
];
const placementDirections: readonly Direction[] = [0, 1];
const SHIP_CLEARANCE = 1;

type Position = Omit<PlacedShip, 'id' | 'type'>;
type Placement = { position: Position; cells: Coordinates[] };

const getCells = (ship: Position, length: number): Coordinates[] => {
  const vector = vectors[ship.direction];

  return Array.from({ length }, (_, index) => {
    return {
      row: ship.row + vector.row * index,
      col: ship.col + vector.col * index,
    };
  });
};

export const getShipCells = (ship: PlacedShip): Coordinates[] => {
  return getCells(ship, SHIP_TYPES[ship.type].length);
};

const isOnBoard = ({ row, col }: Coordinates): boolean => {
  return row >= 0 && row < SIZE && col >= 0 && col < SIZE;
};

const placementsByLength = new Map<number, readonly Placement[]>();

const getPlacements = (type: ShipType): readonly Placement[] => {
  const length = SHIP_TYPES[type].length;
  const cached = placementsByLength.get(length);
  if (cached) {
    return cached;
  }

  const placements: Placement[] = [];

  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      for (const direction of placementDirections) {
        const position = { row, col, direction };
        const cells = getCells(position, length);
        if (cells.every(isOnBoard)) {
          placements.push({ position, cells });
        }
      }
    }
  }

  placementsByLength.set(length, placements);

  return placements;
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

const areCellsFree = (cells: Coordinates[], blocked: ReadonlySet<string>): boolean => {
  return cells.every(({ row, col }) => {
    return !blocked.has(`${row}:${col}`);
  });
};

export const canPositionShip = (ship: PlacedShip, ships: readonly PlacedShip[]): boolean => {
  const otherShips = ships.filter((other) => {
    return other.id !== ship.id;
  });

  const cells = getShipCells(ship);

  return cells.every(isOnBoard) && areCellsFree(cells, getBlockedCells(otherShips));
};

export const findShipPosition = (type: ShipType, ships: readonly PlacedShip[]): PlacedShip | null => {
  const placedCount = ships.filter((ship) => {
    return ship.type === type;
  }).length;

  if (placedCount >= SHIP_TYPES[type].count) {
    return null;
  }

  const shipIds = ships.map((ship) => {
    return ship.id;
  });

  const id = Math.max(0, ...shipIds) + 1;

  const blocked = getBlockedCells(ships);

  const placement = getPlacements(type).find(({ cells }) => {
    return areCellsFree(cells, blocked);
  });

  return placement ? { id, type, ...placement.position } : null;
};

const fleetTypes = (Object.keys(SHIP_TYPES) as ShipType[]).flatMap((type) => {
  return Array.from({ length: SHIP_TYPES[type].count }, () => {
    return type;
  });
});

export const randomizeFleet = (previousShips: readonly PlacedShip[]): PlacedShip[] => {
  const previousBoard = createBoardFromShips(previousShips);
  const ships: PlacedShip[] = [];

  const placeNextShip = (): boolean => {
    if (ships.length === fleetTypes.length) {
      return previousShips.length !== ships.length || ships.some((ship) => {
        return getShipCells(ship).some(({ row, col }) => {
          return !previousBoard[row][col].ship;
        });
      });
    }

    const type = fleetTypes[ships.length];
    const id = ships.length + 1;
    const blocked = getBlockedCells(ships);
    const candidates = getPlacements(type).filter(({ cells }) => {
      return areCellsFree(cells, blocked);
    });

    while (candidates.length > 0) {
      const index = Math.floor(Math.random() * candidates.length);
      const candidate = candidates[index];
      candidates[index] = candidates[candidates.length - 1];
      candidates.pop();

      ships.push({ id, type, ...candidate.position });
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

export const rotateShip = (ship: PlacedShip, step: -1 | 1): PlacedShip => {
  const directionCount = vectors.length;
  const direction = ((ship.direction + step + directionCount) % directionCount) as Direction;
  return { ...ship, direction };
};

export const isFleetComplete = (ships: readonly PlacedShip[]): boolean => {
  const shipIds = ships.map((ship) => {
    return ship.id;
  });
  if (new Set(shipIds).size !== ships.length) {
    return false;
  }

  const hasRequiredCounts = Object.entries(SHIP_TYPES).every(([type, definition]) => {
    const placedCount = ships.filter((ship) => {
      return ship.type === type;
    }).length;
    return placedCount === definition.count;
  });

  return hasRequiredCounts && ships.every((ship) => {
    return canPositionShip(ship, ships);
  });
};

export const createBoardFromShips = (ships: readonly PlacedShip[]) => {
  const board = createEmptyBoard();
  for (const { row, col } of ships.flatMap(getShipCells)) {
    board[row][col].ship = true;
  }
  return board;
};
