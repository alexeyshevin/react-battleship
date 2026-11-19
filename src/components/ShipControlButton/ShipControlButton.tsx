import { useTranslation } from 'react-i18next';
import type { ShipControlAction } from '../../shared/types';
import { IconButton } from '../ui/IconButton/IconButton';

const symbols: Record<ShipControlAction, string> = {
  up: '↑', down: '↓', left: '←', right: '→', clockwise: '↷', counterclockwise: '↶',
};

type Props = {
  action: ShipControlAction;
  disabled?: boolean;
  onClick: () => void;
};

export const ShipControlButton = (props: Props) => {
  const { t } = useTranslation();

  return (
    <IconButton
      className={`ship-control ${props.action}`}
      icon={symbols[props.action]}
      label={t(`placement.${props.action}`)}
      disabled={props.disabled}
      onClick={props.onClick}
    />
  );
};
