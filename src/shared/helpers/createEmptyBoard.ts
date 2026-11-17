import type { Board } from '../types';
import { SIZE } from '../consts';

export const createEmptyBoard = (): Board => {
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ({
      ship: false,
      hit: false,
    })),
  );
};
