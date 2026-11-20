import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SHIP_TYPES, SIZE } from '../../shared/consts';
import { canPositionShip, createBoardFromShips, findShipPosition, getShipCells, isFleetComplete, rotateShip } from '../../shared/helpers/shipPlacement';
import type { Board as BoardModel, PlacedShip, ShipControlAction, ShipType } from '../../shared/types';
import { Board } from '../Board/Board';
import { ShipControlButton } from '../ShipControlButton/ShipControlButton';
import { ShipPlacementButton } from '../ShipPlacementButton/ShipPlacementButton';
import { Button } from '../ui/Button/Button';
import './ShipPlacement.css';

type Props = { onReady: (board: BoardModel) => void };
const actions: ShipControlAction[] = ['up', 'down', 'left', 'right', 'counterclockwise', 'clockwise'];

export const ShipPlacement = (props: Props) => {
  const { t } = useTranslation();
  const [ships, setShips] = useState<PlacedShip[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [noSpace, setNoSpace] = useState(false);
  const selected = ships.find((ship) => ship.id === selectedId);
  const selectedCells = selected ? getShipCells(selected) : [];
  const board = createBoardFromShips(ships);

  const addShip = (type: ShipType) => {
    if (selected) return;
    const ship = findShipPosition(type, ships);
    setNoSpace(!ship);
    if (!ship) return;
    setShips([...ships, ship]);
    setSelectedId(ship.id);
  };

  const getCandidate = (ship: PlacedShip, action: ShipControlAction): PlacedShip => {
    if (action === 'clockwise') return rotateShip(ship, 1);
    if (action === 'counterclockwise') return rotateShip(ship, -1);
    const rowDelta = Number(action === 'down') - Number(action === 'up');
    const colDelta = Number(action === 'right') - Number(action === 'left');
    return { ...ship, row: ship.row + rowDelta, col: ship.col + colDelta };
  };

  const moveShip = (candidate: PlacedShip) => {
    if (!canPositionShip(candidate, ships)) return;
    setShips(ships.map((ship) => ship.id === candidate.id ? candidate : ship));
    setNoSpace(false);
  };

  const selectCell = (row: number, col: number) => {
    if (selected) return;
    const ship = ships.find((item) => getShipCells(item)
      .some((cell) => cell.row === row && cell.col === col));
    if (ship) {
      setSelectedId(ship.id);
    }
  };

  const confirmShip = () => {
    if (!selected || !canPositionShip(selected, ships)) return;
    setSelectedId(null);
    setNoSpace(false);
  };

  const removeSelected = () => {
    setShips(ships.filter((ship) => ship.id !== selectedId));
    setSelectedId(null);
    setNoSpace(false);
  };

  return (
    <section className="ship-placement" aria-labelledby="placement-title">
      <h3 id="placement-title">{t('placement.title')}</h3>
      <p>{t('placement.instructions')}</p>
      <ul className="fleet-list">
        {(Object.keys(SHIP_TYPES) as ShipType[]).map((type) => {
          const definition = SHIP_TYPES[type];
          const isConfirming = selected?.type === type;
          const remaining = definition.count - ships.filter((ship) => ship.type === type).length;
          return (
            <li key={type}>
              <span>{t(`placement.ships.${type}`)} · {t('placement.length', { count: definition.length })}</span>
              <span>{t('placement.remaining', { count: remaining })}</span>
              <ShipPlacementButton
                shipType={type}
                isConfirming={isConfirming}
                disabled={!isConfirming && (remaining === 0 || Boolean(selected))}
                onClick={isConfirming ? confirmShip : () => addShip(type)}
              />
            </li>
          );
        })}
      </ul>
      {noSpace && <p role="status">{t('placement.noSpace')}</p>}
      <div className="placement-field">
        <Board
          title={t('game.playerBoard')}
          board={board}
          onCellClick={selectCell}
          isCellSelected={(row, col) => selectedCells.some((cell) => cell.row === row && cell.col === col)}
        />
        {selected && (
          <div className="placement-controls-layer">
            <div className="ship-controls" role="group" aria-label={t('placement.controls')}
              style={{ left: `clamp(52px, ${(selected.col + 0.5) / SIZE * 100}%, calc(100% - 52px))`,
                top: `clamp(52px, ${(selected.row + 0.5) / SIZE * 100}%, calc(100% - 52px))` }}>
              {actions.map((action) => {
                const isRotation = action === 'clockwise' || action === 'counterclockwise';
                if (isRotation && Number(SHIP_TYPES[selected.type].length) === 1) {
                  return null;
                }

                const candidate = getCandidate(selected, action);
                return (
                  <ShipControlButton
                    key={action}
                    action={action}
                    disabled={!canPositionShip(candidate, ships)}
                    onClick={() => moveShip(candidate)}
                  />);
              })}
            </div>
          </div>
        )}
      </div>
      {selected && <Button onClick={removeSelected}>{t('placement.remove')}</Button>}
      <Button
        disabled={Boolean(selected) || !isFleetComplete(ships)}
        onClick={() => {
            if (!selected && isFleetComplete(ships)) props.onReady(createBoardFromShips(ships));
          }}
      >
        {t('placement.ready')}
      </Button>

    </section>
  );
};
