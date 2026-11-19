import type { Player } from '../types';

export const DRAW_NUMBERS = Array.from({ length: 10 }, (_, index) => index + 1);

export const DRAW_DURATION_MS = 5000;

export const chooseBotNumber = (playerNumber: number): number => {
  const availableNumbers = DRAW_NUMBERS.filter((number) => number !== playerNumber);
  return availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
};

export const drawFirstTurn = (): Player => {
  return Math.random() < 0.5 ? 'player' : 'bot';
};
