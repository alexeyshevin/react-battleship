export const BOARD_COLUMNS = Array.from('ABCDEFGHIJ');
export const SIZE = BOARD_COLUMNS.length;

export const SHIP_TYPES = {
  carrier: { length: 5, count: 1 },
  battleship: { length: 4, count: 1 },
  cruiser: { length: 3, count: 2 },
  destroyer: { length: 2, count: 1 },
} as const;
