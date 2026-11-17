import type { ru } from './ru';

type TranslationShape<T> = {
  [Key in keyof T]: T[Key] extends string ? string : TranslationShape<T[Key]>;
};

export const en = {
  app: { title: 'Battleship' },
  language: { label: 'Language' },
  game: {
    reset: 'Reset game',
    playerBoard: 'My board',
    enemyBoard: 'Opponent’s board',
    status: {
      ready: 'Fire at the opponent’s board!',
      newGame: 'New game. Fire at the opponent’s board!',
      hit: 'Hit!',
      miss: 'Miss!',
    },
  },
  cell: {
    coordinates: 'Row {{row}}, column {{col}}',
    label: '{{coordinates}}: {{description}}',
    hit: 'hit',
    miss: 'miss',
    ship: 'ship',
    untouched: 'not fired at',
  },
} as const satisfies TranslationShape<typeof ru>;
