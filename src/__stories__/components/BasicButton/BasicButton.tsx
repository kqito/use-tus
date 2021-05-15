import { ComponentProps, forwardRef } from 'react';

import './basicButton.css';

type BasicButtonProps = {
  onClick: ComponentProps<'button'>['onClick'];
  title: string;
  disabled?: ComponentProps<'button'>['disabled'];
  styleColor?: 'primary' | 'basic' | 'error';
};

export const BasicButton = forwardRef<HTMLButtonElement, BasicButtonProps>(
  ({ onClick, title, disabled, styleColor = 'primary' }, ref) => (
    <button
      className={`basic-button ${styleColor}`}
      onClick={onClick}
      type="button"
      disabled={disabled}
      ref={ref}
    >
      {title}
    </button>
  )
);
