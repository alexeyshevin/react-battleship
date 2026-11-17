export interface Cell {
  ship: boolean;
  hit: boolean;
}

export type Board = Cell[][];

// Представление поля для компонентов, которым не нужно изменять игровую модель.
export type BoardView = ReadonlyArray<ReadonlyArray<Readonly<Cell>>>;
