import clsx from 'clsx';
import { ComponentProps, forwardRef } from 'react';

type BasicButtonProps = {
  onClick: ComponentProps<'button'>['onClick'];
  title: string;
  disabled?: ComponentProps<'button'>['disabled'];
  styleColor?: 'primary' | 'basic' | 'error';
};

export const BasicButton = forwardRef<HTMLButtonElement, BasicButtonProps>(
  ({ onClick, title, disabled, styleColor = 'primary' }, ref) => (
    <button
      className={clsx(
        'appearance-none py-2 px-4 rounded-2xl transition no-underline text-white w-full disabled:cursor-default',
        {
          'bg-blue-400 hover:bg-blue-500 disabled:bg-blue-100':
            styleColor === 'primary',
          'bg-gray-500 hover:bg-gray-600 disabled:bg-gray-100':
            styleColor === 'basic',
          'bg-red-400 hover:bg-red-500 disabled:bg-red-100':
            styleColor === 'error',
        }
      )}
      onClick={onClick}
      type="button"
      disabled={disabled}
      ref={ref}
    >
      {title}
    </button>
  )
);
