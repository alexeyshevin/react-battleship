import type { Player } from '../types';

export const DRAW_RANGE = { min: 1, max: 10 } as const;
export const DRAW_NUMBERS = Array.from({ length: DRAW_RANGE.max - DRAW_RANGE.min + 1 }, (_, index) => {
  return DRAW_RANGE.min + index;
});

export const DRAW_DURATION_MS = 5000;
const PLAYER_WIN_PROBABILITY = 0.5;

export const chooseBotNumber = (playerNumber: number): number => {
  const availableNumbers = DRAW_NUMBERS.filter((number) => {
    return number !== playerNumber;
  });
  return availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
};

export const drawFirstTurn = (): Player => {
  return Math.random() < PLAYER_WIN_PROBABILITY ? 'player' : 'bot';
};
