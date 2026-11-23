import type { Board } from '../types';
import { SIZE } from '../consts';

export const createEmptyBoard = (): Board => {
  return Array.from({ length: SIZE }, () => {
    return Array.from({ length: SIZE }, () => {
      return { ship: false, hit: false };
    });
  });
};
