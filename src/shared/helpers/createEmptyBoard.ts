import { SIZE } from "../consts";

export const createEmptyBoard = () => {
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ({
      ship: false,
      hit: false,
    }))
  );
}