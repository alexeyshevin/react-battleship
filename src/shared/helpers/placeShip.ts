import { SIZE } from "../consts";
import { canPlaceShip } from "./canPlaceShip";

export const placeShip = (board: any, length: number) => {
  let placed = false;

  while (!placed) {
    const horizontal = Math.random() > 0.5;
    const row = Math.floor(Math.random() * SIZE);
    const col = Math.floor(Math.random() * SIZE);

    if (canPlaceShip(board, row, col, length, horizontal)) {
      for (let i = 0; i < length; i++) {
        const r = horizontal ? row : row + i;
        const c = horizontal ? col + i : col;
        board[r][c].ship = true;
      }

      placed = true;
    }
  }
}