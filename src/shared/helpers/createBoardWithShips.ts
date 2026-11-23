import { createBoardFromShips, randomizeFleet } from './shipPlacement';

export const createBoardWithShips = () => {
  return createBoardFromShips(randomizeFleet([]));
};
