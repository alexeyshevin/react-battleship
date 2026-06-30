import { SIZE } from "../consts";

export const canPlaceShip = (
  board: any,
  row: number,
  col: number,
  length: number,
  horizontal: boolean
) => {
  for (let i = 0; i < length; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;

    if (r >= SIZE || c >= SIZE || board[r][c].ship) {
      return false;
    }
  }

  return true;
}