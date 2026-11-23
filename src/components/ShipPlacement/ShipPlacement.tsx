import type { CSSProperties } from 'react';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SHIP_TYPES, SIZE } from '../../shared/consts';
import {
  canPositionShip,
  createBoardFromShips,
  findShipPosition,
  getShipCells,
  isFleetComplete,
  randomizeFleet,
  rotateShip,
} from '../../shared/helpers/shipPlacement';
import type {
  Board as BoardModel,
  PlacedShip,
  ShipControlAction,
  ShipType,
} from '../../shared/types';
import { Board } from '../Board/Board';
import { ShipControlButton } from '../ShipControlButton/ShipControlButton';
import { ShipPlacementButton } from '../ShipPlacementButton/ShipPlacementButton';
import { Button } from '../ui/Button/Button';
import './ShipPlacement.css';

type Props = {
  onReady: (board: BoardModel) => void;
};

const shipTypes = Object.keys(SHIP_TYPES) as ShipType[];
const actions: ShipControlAction[] = ['up', 'down', 'left', 'right', 'counterclockwise', 'clockwise'];

type ControlPosition = CSSProperties & {
  '--ship-control-x': string;
  '--ship-control-y': string;
};

const getCellCenter = (coordinate: number) => {
  return `${(coordinate + 0.5) / SIZE * 100}%`;
};

export const ShipPlacement = (props: Props) => {
  const titleId = useId();
  const { t } = useTranslation();
  const [ships, setShips] = useState<PlacedShip[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [noSpace, setNoSpace] = useState(false);
  const [isInstructionShown, setIsInstructionShown] = useState<boolean>(false);
  const selected = ships.find((ship) => {
    return ship.id === selectedId;
  });
  const selectedCells = selected ? getShipCells(selected) : [];
  const controlPosition: ControlPosition | undefined = selected && {
    '--ship-control-x': getCellCenter(selected.col),
    '--ship-control-y': getCellCenter(selected.row),
  };
  const board = createBoardFromShips(ships);

  const handleAdd = (type: ShipType) => {
    if (selected) {
      return;
    }

    const ship = findShipPosition(type, ships);
    setNoSpace(!ship);

    if (!ship) {
      return;
    }

    setShips([...ships, ship]);

    setSelectedId(ship.id);
  };

  const getCandidate = (ship: PlacedShip, action: ShipControlAction): PlacedShip => {
    if (action === 'clockwise') {
      return rotateShip(ship, 1);
    }

    if (action === 'counterclockwise') {
      return rotateShip(ship, -1);
    }

    const rowDelta = Number(action === 'down') - Number(action === 'up');
    const colDelta = Number(action === 'right') - Number(action === 'left');
    return { ...ship, row: ship.row + rowDelta, col: ship.col + colDelta };
  };

  const moveShip = (candidate: PlacedShip) => {
    if (!canPositionShip(candidate, ships)) {
      return;
    }

    setShips(ships.map((ship) => {
      return ship.id === candidate.id ? candidate : ship;
    }));
    setNoSpace(false);
  };

  const handleSelectCell = (row: number, col: number) => {
    if (selected) {
      return;
    }

    const ship = ships.find((item) => {
      return getShipCells(item).some((cell) => {
        return cell.row === row && cell.col === col;
      });
    });
    if (ship) {
      setSelectedId(ship.id);
    }
  };

  const handleToggleInstruction = () => {
    setIsInstructionShown((isShown) => {
      return !isShown;
    });
  };

  const handleConfirmShip = () => {
    if (!selected || !canPositionShip(selected, ships)) {
      return;
    }

    setSelectedId(null);
    setNoSpace(false);
  };

  const handleRemoveSelected = () => {
    setShips(ships.filter((ship) => {
      return ship.id !== selectedId;
    }));

    setSelectedId(null);
    setNoSpace(false);
  };

  const handleRandomize = () => {
    setShips(randomizeFleet(ships));
    setSelectedId(null);
    setNoSpace(false);
  };

  const renderShip = (type: ShipType) => {
    const definition = SHIP_TYPES[type];
    const isConfirming = selected?.type === type;

    const placedCount = ships.filter((ship) => {
      return ship.type === type;
    }).length;

    const remaining = definition.count - placedCount;
    const isAddDisabled = !isConfirming && (remaining === 0 || Boolean(selected));
    const handleAddShip = () => {
      handleAdd(type);
    };

    return (
      <li key={type}>
        <span>{t(`placement.ships.${type}`)} · {t('placement.length', { count: definition.length })}</span>
        <span>{t('placement.remaining', { count: remaining })}</span>
        <ShipPlacementButton
          shipType={type}
          isConfirming={isConfirming}
          disabled={isAddDisabled}
          onClick={isConfirming ? handleConfirmShip : handleAddShip}
        />
      </li>
    );
  };

  const renderControl = (action: ShipControlAction) => {
    const isRotation = action === 'clockwise' || action === 'counterclockwise';
    if (!selected || (isRotation && Number(SHIP_TYPES[selected.type].length) === 1)) {
      return null;
    }

    const candidate = getCandidate(selected, action);
    const canMove = canPositionShip(candidate, ships);
    const handleMoveShip = () => {
      moveShip(candidate);
    };

    return (
      <ShipControlButton
        key={action}
        action={action}
        disabled={!canMove}
        onClick={handleMoveShip}
      />
    );
  };

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some((cell) => {
      return cell.row === row && cell.col === col;
    });
  };

  const canFinish = !selected && isFleetComplete(ships);
  const handleReady = () => {
    if (canFinish) {
      props.onReady(createBoardFromShips(ships));
    }
  };

  return (
    <section className="ship-placement" aria-labelledby={titleId}>
      <h3 id={titleId}>{t('placement.title')}</h3>
      {!isInstructionShown && (
        <Button
          onClick={handleToggleInstruction}
        >
          {t('placement.showInstruction')}
        </Button>
      )}
      {isInstructionShown && (
        <p>
          {t('placement.instructions')}{' '}
          <button
            type="button"
            className="placement-hide-instruction"
            onClick={handleToggleInstruction}
          >
            {t('placement.hideInstruction')}
          </button>
        </p>
      )}
      {noSpace && <p role="status">{t('placement.noSpace')}</p>}
      <div className="placement-layout">
        <ul className="fleet-list">
          {shipTypes.map(renderShip)}
        </ul>
        <Button onClick={handleRandomize}>{t('placement.randomize')}</Button>
        <div className="placement-field">
          <Board
            title={t('game.playerBoard')}
            board={board}
            onCellClick={handleSelectCell}
            isCellSelected={isCellSelected}
          />
          {controlPosition && (
            <div className="placement-controls-layer">
              <div className="ship-controls" role="group" aria-label={t('placement.controls')} style={controlPosition}>
                {actions.map(renderControl)}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="placement-actions">
        {selected && <Button onClick={handleRemoveSelected}>{t('placement.remove')}</Button>}
        <Button className="placement-ready" disabled={!canFinish} onClick={handleReady}>
          {t('placement.ready')}
        </Button>
      </div>
    </section>
  );
};
