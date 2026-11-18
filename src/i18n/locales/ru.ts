export const ru = {
  app: { title: 'Морской бой' },
  language: { label: 'Язык' },
  modes: {
    choose: 'Выбери режим игры',
    back: 'К выбору режима',
    bot: {
      title: 'Игра с компьютером',
      description: 'Морской бой против компьютера.',
      select: 'Выбрать компьютер',
    },
    journal: {
      title: 'Игра с другом',
      description: 'Каждый ведёт своё поле и боевой журнал на своём компьютере.',
      select: 'Выбрать игру с другом',
    },
  },
  draw: {
    title: 'Кто ходит первым?',
    choose: 'Выбери число от 1 до 10',
    choices: 'Твоё число: {{playerNumber}}. Число компьютера: {{botNumber}}.',
    start: 'Запустить жеребьёвку',
    spinning: 'Жеребьёвка… 5 секунд',
    result: 'Выпало число {{number}}.',
    first: { player: 'Первым ходишь ты.', bot: 'Первым ходит компьютер.' },
  },
  game: {
    reset: 'Сбросить игру',
    journalBoard: 'Боевой журнал',
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
