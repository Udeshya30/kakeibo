import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from '@/shared/ui/actions/Button.module.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly children: ReactNode;
  readonly variant?: 'primary' | 'secondary';
}

export function Button({ children, className, variant = 'primary', type = 'button', ...props }: ButtonProps) {
  const classNames = [styles.button, styles[variant], className].filter(Boolean).join(' ');

  return (
    <button className={classNames} type={type} {...props}>
      {children}
    </button>
  );
}
