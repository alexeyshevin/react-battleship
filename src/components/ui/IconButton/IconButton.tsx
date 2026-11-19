import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Button } from '../Button/Button';
import './IconButton.css';

type Props = Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'aria-label'> & {
  icon: ReactNode;
  label: string;
};

export const IconButton = (props: Props) => {
  const { icon, label, className = '', ...buttonProps } = props;

  return (
    <Button {...buttonProps} className={`icon-button ${className}`.trim()} aria-label={label} title={label}>
      <span aria-hidden="true">{icon}</span>
    </Button>
  );
};
