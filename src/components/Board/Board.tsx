import type { CSSProperties } from 'react';
import { Fragment, useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { BoardView, Cell } from '../../shared/types';
import { BoardCell } from '../BoardCell/BoardCell';
import './Board.css';

type Props = {
  title: string;
  board: BoardView;
  concealShips?: boolean;
  isCellSelected?: (row: number, col: number) => boolean;
  onCellClick?: (row: number, col: number) => void;
};

export const Board = (props: Props) => {
  const titleId = useId();
  const { t } = useTranslation();

  const columnLabels = Array.from(t('cell.columns'));

  const renderColumnLabel = (letter: string) => {
    return <span key={letter} className="board-coordinate" aria-hidden="true">{letter}</span>;
  };

  const renderRow = (row: BoardView[number], rowIndex: number) => {
    const renderCell = (cell: Readonly<Cell>, colIndex: number) => {
      const handleCellClick = () => {
        props.onCellClick?.(rowIndex, colIndex);
      };

      return (
        <BoardCell
          key={`${rowIndex}-${colIndex}`}
          cell={cell}
          selected={props.isCellSelected?.(rowIndex, colIndex)}
          concealShip={props.concealShips}
          label={t('cell.coordinates', { row: rowIndex + 1, col: columnLabels[colIndex] })}
          onClick={props.onCellClick ? handleCellClick : undefined}
        />
      );
    };

    return (
      <Fragment key={rowIndex}>
        <span className="board-coordinate" aria-hidden="true">{rowIndex + 1}</span>
        {row.map(renderCell)}
      </Fragment>
    );
  };

  const boardStyle: CSSProperties & { '--board-size': number } = {
    '--board-size': props.board.length,
  };

  return (
    <section className="board-panel" aria-labelledby={titleId}>
      <h2 id={titleId}>{props.title}</h2>
      <div className="board" style={boardStyle}>
        <span aria-hidden="true" />
        {columnLabels.slice(0, props.board.length).map(renderColumnLabel)}
        {props.board.map(renderRow)}
      </div>
    </section>
  );
};
