import { useTranslation } from 'react-i18next';
import type { ShipType } from '../../shared/types';
import { IconButton } from '../ui/IconButton/IconButton';

type Props = {
  shipType: ShipType;
  isConfirming: boolean;
  disabled?: boolean;
  onClick: () => void;
};

const placementIcons = {
  confirm: '✓',
  add: '+',
};

export const ShipPlacementButton = (props: Props) => {
  const { t } = useTranslation();
  const labelKey = props.isConfirming ? 'placement.confirm' : 'placement.add';
  const label = t(labelKey, { ship: t(`placement.ships.${props.shipType}`) });
  const icon = props.isConfirming ? placementIcons.confirm : placementIcons.add;

  return (
    <IconButton icon={icon} label={label} disabled={props.disabled} onClick={props.onClick} />
  );
};
