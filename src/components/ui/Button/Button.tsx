import type { ComponentPropsWithoutRef } from 'react';
import './Button.css';

type Props = ComponentPropsWithoutRef<'button'>;

export function Button({ className = '', type = 'button', ...props }: Props) {
  return <button type={type} className={`button ${className}`.trim()} {...props} />;
}
