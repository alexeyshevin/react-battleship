import { useTranslation } from 'react-i18next';
import type { ShipType } from '../../shared/types';
import { IconButton } from '../ui/IconButton/IconButton';

type Props = {
  shipType: ShipType;
  isConfirming: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export const ShipPlacementButton = (props: Props) => {
  const { t } = useTranslation();
  const labelKey = props.isConfirming ? 'placement.confirm' : 'placement.add';
  const label = t(labelKey, { ship: t(`placement.ships.${props.shipType}`) });

  return (
    <IconButton icon={props.isConfirming ? '✓' : '+'} label={label}
      disabled={props.disabled} onClick={props.onClick} />
  );
};
