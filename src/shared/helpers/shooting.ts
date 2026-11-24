import type { Board, Coordinates, Player } from '../types';

export const chooseBotTarget = (board: Board): Coordinates | undefined => {
  const targets: Coordinates[] = [];
  board.forEach((cells, row) => {
    cells.forEach((cell, col) => {
      if (!cell.hit) {
        targets.push({ row, col });
      }
    });
  });

  return targets[Math.floor(Math.random() * targets.length)];
};

export const resolveShot = (board: Board, target: Coordinates, shooter: Player) => {
  const { row, col } = target;
  const cell = board[row][col];
  if (cell.hit) {
    return;
  }

  const updatedRow = board[row].with(col, { ...cell, hit: true });
  const updatedBoard = board.with(row, updatedRow);
  const fleetDestroyed = cell.ship && !updatedBoard.some((cells) => {
    return cells.some((square) => {
      return square.ship && !square.hit;
    });
  });
  const opponent: Player = shooter === 'player' ? 'bot' : 'player';
  const nextPlayer = cell.ship ? shooter : opponent;
  return { board: updatedBoard, nextPlayer: fleetDestroyed ? null : nextPlayer, hit: cell.ship };
};
