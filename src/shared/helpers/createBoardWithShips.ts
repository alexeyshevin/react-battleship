import { SHIPS } from "../consts";
import { createEmptyBoard } from "./createEmptyBoard";
import { placeShip } from "./placeShip";

export const createBoardWithShips = () => {
  const board = createEmptyBoard();

  SHIPS.forEach((shipLength) => {
    placeShip(board, shipLength);
  });

  return board;
}