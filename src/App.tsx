import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './components/LanguageSwitcher/LanguageSwitcher';
import type { ru } from './i18n/locales/ru';

import { Board } from './components/Board/Board';
import { GameStatus } from './components/GameStatus/GameStatus';
import { Button } from './components/ui/Button/Button';
import { createBoardWithShips } from './shared/helpers/createBoardWithShips';
import './App.css';

type GameStatusKey = keyof typeof ru.game.status;

const App = () => {
  const { t } = useTranslation();
  const [playerBoard, setPlayerBoard] = useState(createBoardWithShips);
  const [enemyBoard, setEnemyBoard] = useState(createBoardWithShips);
  const [message, setMessage] = useState<GameStatusKey>('ready');

  function handleEnemyCellClick(row: number, col: number) {
    const cell = enemyBoard[row][col];

    if (cell.hit) {
      return;
    }

    const updatedBoard = enemyBoard.map((boardRow) =>
      boardRow.map((cell) => ({ ...cell })),
    );

    updatedBoard[row][col].hit = true;
    setMessage(cell.ship ? 'hit' : 'miss');
    setEnemyBoard(updatedBoard);
  }

  function resetGame() {
    setPlayerBoard(createBoardWithShips());
    setEnemyBoard(createBoardWithShips());
    setMessage('newGame');
  }

  return (
    <main className="game">
      <LanguageSwitcher />
      <h1>{t('app.title')}</h1>
      <GameStatus message={t(`game.status.${message}`)} />
      <div className="game-actions">
        <Button onClick={resetGame}>{t('game.reset')}</Button>
      </div>
      <div className="boards">
        <Board title={t('game.playerBoard')} board={playerBoard} />
        <Board
          title={t('game.enemyBoard')}
          board={enemyBoard}
          concealShips
          onCellClick={handleEnemyCellClick}
        />
      </div>
    </main>
  );
};

export default App;
