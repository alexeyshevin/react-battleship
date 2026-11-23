import type { ComponentPropsWithoutRef } from 'react';
import './Button.css';

type Props = ComponentPropsWithoutRef<'button'>;

export const Button = (props: Props) => {
  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      className={`button ${props.className ?? ''}`.trim()}
    />
  );
};
