import { useTranslation } from 'react-i18next';
import type { Cell } from '../../shared/types';
import './BoardCell.css';

type Props = {
  cell: Readonly<Cell>;
  concealShip?: boolean;
  label: string;
  onClick?: () => void;
}

export const BoardCell = (props: Props) => {
  const { t } = useTranslation();
  const isShipVisible = !props.concealShip && props.cell.ship;
  const shotState = props.cell.ship ? 'hit' : 'miss';
  const intactState = isShipVisible ? 'ship' : '';
  const state = props.cell.hit ? shotState : intactState;

  const shotDescription = props.cell.ship ? t('cell.hit') : t('cell.miss');
  const intactDescription = isShipVisible ? t('cell.ship') : t('cell.untouched');
  const description = props.cell.hit ? shotDescription : intactDescription;
  const isDisabled = !props.onClick || props.cell.hit;

  return (
    <button
      type="button"
      className={`cell ${state}`.trim()}
      aria-label={t('cell.label', { coordinates: props.label, description })}
      disabled={isDisabled}
      onClick={props.onClick}
    />
  );
};
