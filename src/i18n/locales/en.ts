import type { ru } from './ru';

type TranslationShape<T> = {
  [Key in keyof T]: T[Key] extends string ? string : TranslationShape<T[Key]>;
};

export const en = {
  app: { title: 'Battleship' },
  language: { label: 'Language' },
  modes: {
    choose: 'Choose a game mode',
    back: 'Back to mode selection',
    bot: {
      title: 'Play against the computer',
      description: 'A game of Battleship against the computer.',
      select: 'Choose computer',
    },
    journal: {
      title: 'Play with a friend',
      description: 'Each player keeps their own board and battle log on their own computer.',
      select: 'Choose friend',
    },
  },
  placement: {
    title: 'Place your ships',
    instructions: 'Add a ship with +, move or rotate it using the surrounding buttons, then confirm with the checkmark in the same row. Select a placed ship on the board to edit it. Or click "Randomize" to place your ships automatically.',
    randomize: 'Randomize',
    length: 'Cells: {{count}}',
    remaining: 'Remaining: {{count}}',
    add: 'Add: {{ship}}',
    confirm: 'Confirm position: {{ship}}',
    controls: 'Selected ship controls',
    up: 'Move up', down: 'Move down', left: 'Move left', right: 'Move right',
    clockwise: 'Rotate clockwise',
    counterclockwise: 'Rotate counterclockwise',
    remove: 'Remove selected ship',
    ready: 'Finish placement',
    noSpace: 'No room for this ship. Move or remove other ships.',
    ships: { carrier: 'Aircraft carrier', battleship: 'Battleship', cruiser: 'Cruiser', destroyer: 'Destroyer' },
  },
  draw: {
    title: 'Who goes first?',
    choose: 'Choose a number from 1 to 10',
    choices: 'Your number: {{playerNumber}}. Computer’s number: {{botNumber}}.',
    start: 'Start the draw',
    spinning: 'Drawing…',
    countdown: 'Result in: {{seconds}} s',
    result: 'The number drawn is {{number}}.',
    first: { player: 'You go first.', bot: 'The computer goes first.' },
  },
  game: {
    start: 'Start game',
    reset: 'Reset game',
    journalBoard: 'Battle log',
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
