import { useState } from 'react';
import { Board } from './components/Board/Board';
import { GameStatus } from './components/GameStatus/GameStatus';
import { Button } from './components/ui/Button/Button';
import { createBoardWithShips } from './shared/helpers/createBoardWithShips';
import './App.css';

const App = () => {
  const [playerBoard, setPlayerBoard] = useState(createBoardWithShips);
  const [enemyBoard, setEnemyBoard] = useState(createBoardWithShips);
  const [message, setMessage] = useState('Стреляй по полю противника!');

  function handleEnemyCellClick(row: number, col: number) {
    const cell = enemyBoard[row][col];

    if (cell.hit) {
      return;
    }

    const updatedBoard = enemyBoard.map((boardRow) =>
      boardRow.map((cell) => ({ ...cell })),
    );

    updatedBoard[row][col].hit = true;
    setMessage(cell.ship ? 'Попадание!' : 'Мимо!');
    setEnemyBoard(updatedBoard);
  }

  function resetGame() {
    setPlayerBoard(createBoardWithShips());
    setEnemyBoard(createBoardWithShips());
    setMessage('Новая игра. Стреляй по полю противника!');
  }

  return (
    <main className="game">
      <h1>Морской бой</h1>
      <GameStatus message={message} />
      <div className="game-actions">
        <Button onClick={resetGame}>Сбросить игру</Button>
      </div>
      <div className="boards">
        <Board title="Моё поле" board={playerBoard} />
        <Board
          title="Поле противника"
          board={enemyBoard}
          concealShips
          onCellClick={handleEnemyCellClick}
        />
      </div>
    </main>
  );
};

export default App;
