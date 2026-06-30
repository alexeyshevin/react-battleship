import { useState } from 'react';
import './App.css';
import { createBoardWithShips } from './shared/helpers/createBoardWithShips';
import './styles.css';

const App = () => {
  const [playerBoard, setPlayerBoard] = useState(createBoardWithShips);
  const [enemyBoard, setEnemyBoard] = useState(createBoardWithShips);
  const [message, setMessage] = useState("Стреляй по полю противника!");

  function handleEnemyCellClick(row: number, col: number) {
    const cell = enemyBoard[row][col];

    if (cell.hit) {
      return;
    }

    const updatedBoard = enemyBoard.map((boardRow) =>
      boardRow.map((cell) => ({ ...cell }))
    );

    updatedBoard[row][col].hit = true;

    if (updatedBoard[row][col].ship) {
      setMessage("Попадание!");
    } else {
      setMessage("Мимо!");
    }

    setEnemyBoard(updatedBoard);
  }

  function resetGame() {
    setPlayerBoard(createBoardWithShips());
    setEnemyBoard(createBoardWithShips());
    setMessage("Новая игра. Стреляй по полю противника!");
  }

  function renderBoard(board: any, isEnemy: boolean) {
    return (
      <div className="board">
        {board.map((row: any, rowIndex: number) =>
          row.map((cell: any, colIndex: number) => {
            let className = "cell";

            if (!isEnemy && cell.ship) {
              className += " ship";
            }

            if (cell.hit && cell.ship) {
              className += " hit";
            }

            if (cell.hit && !cell.ship) {
              className += " miss";
            }

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={className}
                onClick={() =>
                  isEnemy && handleEnemyCellClick(rowIndex, colIndex)
                }
              />
            );
          })
        )}
      </div>
    );
  }

  return (
    <div className="game">
      <h1>Морской бой</h1>

      <p>{message}</p>

      <button className="reset-button" onClick={resetGame}>
        Сбросить игру
      </button>

      <div className="boards">
        <div>
          <h2>Моё поле</h2>
          {renderBoard(playerBoard, false)}
        </div>

        <div>
          <h2>Поле противника</h2>
          {renderBoard(enemyBoard, true)}
        </div>
      </div>
    </div>
  );
}

export default App;
