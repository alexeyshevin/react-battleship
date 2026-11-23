import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Button } from '../Button/Button';
import './IconButton.css';

type Props = Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'aria-label'> & {
  icon: ReactNode;
  label: string;
};

export const IconButton = (props: Props) => {
  const buttonProps: Partial<Props> = { ...props };
  delete buttonProps.icon;
  delete buttonProps.label;

  return (
    <Button
      {...buttonProps}
      className={`icon-button ${props.className ?? ''}`.trim()}
      aria-label={props.label}
      title={props.label}
    >
      <span aria-hidden="true">{props.icon}</span>
    </Button>
  );
};
