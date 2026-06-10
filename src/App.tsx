import { useState } from 'react';
import './App.css';
import './styles.css';

const SIZE = 10;
const SHIPS = [5, 4, 3, 3, 2];

function createEmptyBoard() {
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ({
      ship: false,
      hit: false,
    }))
  );
}

function canPlaceShip(board, row, col, length, horizontal) {
  for (let i = 0; i < length; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;

    if (r >= SIZE || c >= SIZE || board[r][c].ship) {
      return false;
    }
  }

  return true;
}

function placeShip(board, length) {
  let placed = false;

  while (!placed) {
    const horizontal = Math.random() > 0.5;
    const row = Math.floor(Math.random() * SIZE);
    const col = Math.floor(Math.random() * SIZE);

    if (canPlaceShip(board, row, col, length, horizontal)) {
      for (let i = 0; i < length; i++) {
        const r = horizontal ? row : row + i;
        const c = horizontal ? col + i : col;
        board[r][c].ship = true;
      }

      placed = true;
    }
  }
}

function createBoardWithShips() {
  const board = createEmptyBoard();

  SHIPS.forEach((shipLength) => {
    placeShip(board, shipLength);
  });

  return board;
}

function App {
  const [playerBoard, setPlayerBoard] = useState(createBoardWithShips);
  const [enemyBoard, setEnemyBoard] = useState(createBoardWithShips);
  const [message, setMessage] = useState("Стреляй по полю противника!");

  function handleEnemyCellClick(row, col) {
    const cell = enemyBoard[row][col];

    if (cell.hit) return;

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

  function renderBoard(board, isEnemy) {
    return (
      <div className="board">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
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
