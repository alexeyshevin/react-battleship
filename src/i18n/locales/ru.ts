export const ru = {
  app: { title: 'Морской бой' },
  language: { label: 'Язык' },
  game: {
    reset: 'Сбросить игру',
    playerBoard: 'Моё поле',
    enemyBoard: 'Поле противника',
    status: {
      ready: 'Стреляй по полю противника!',
      newGame: 'Новая игра. Стреляй по полю противника!',
      hit: 'Попадание!',
      miss: 'Мимо!',
    },
  },
  cell: {
    coordinates: 'Строка {{row}}, столбец {{col}}',
    label: '{{coordinates}}: {{description}}',
    hit: 'попадание',
    miss: 'промах',
    ship: 'корабль',
    untouched: 'не обстреляна',
  },
} as const;
