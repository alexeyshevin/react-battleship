import type { SHIP_TYPES } from './consts';

export interface Cell {
  ship: boolean;
  hit: boolean;
}

export type Board = Cell[][];

// Представление поля для компонентов, которым не нужно изменять игровую модель.
export type BoardView = ReadonlyArray<ReadonlyArray<Readonly<Cell>>>;

export type GameMode = 'bot' | 'journal';

export type Player = 'player' | 'bot';

export type GameTypeSelection = {
  playerNumber: number;
  botNumber: number;
};

export type DrawState =
  | { phase: 'choosing'; selection: GameTypeSelection | null }
  | { phase: 'spinning'; selection: GameTypeSelection; winner: Player }
  | { phase: 'complete'; selection: GameTypeSelection; winner: Player };

export type ShipType = keyof typeof SHIP_TYPES;
export type Direction = 0 | 1 | 2 | 3;

export type PlacedShip = {
  id: number;
  type: ShipType;
  row: number;
  col: number;
  direction: Direction;
};

export type Coordinates = { row: number; col: number };

export type ShipControlAction = 'up' | 'down' | 'left' | 'right' | 'clockwise' | 'counterclockwise';
