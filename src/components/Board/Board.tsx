import type { CSSProperties } from 'react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { BoardView } from '../../shared/types';
import { BoardCell } from '../BoardCell/BoardCell';
import './Board.css';

type Props = {
  title: string;
  board: BoardView;
  concealShips?: boolean;
  onCellClick?: (row: number, col: number) => void;
}

export const Board = (props: Props) => {
  const titleId = useId();
  const { t } = useTranslation();

  const renderBoardCells = () => {
    return (
      props.board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <BoardCell
            key={`${rowIndex}-${colIndex}`}
            cell={cell}
            concealShip={props.concealShips}
            label={t('cell.coordinates', { row: rowIndex + 1, col: colIndex + 1 })}
            onClick={props.onCellClick ? () => props.onCellClick?.(rowIndex, colIndex) : undefined}
          />
        )),
      )
    );
  };

  const boardStyle: CSSProperties & { '--board-size': number } = {
    '--board-size': props.board.length,
  };

  return (
    <section className="board-panel" aria-labelledby={titleId}>
      <h2 id={titleId}>{props.title}</h2>
      <div className="board" style={boardStyle}>
        {renderBoardCells()}
      </div>
    </section>
  );
};
