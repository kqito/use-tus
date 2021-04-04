import { render, act } from '@testing-library/react';
import { ERROR_MESSAGES, TusClientProvider } from '../core/TusClientProvider';

/* eslint-disable no-console */

jest.mock('tus-js-client', () => ({
  isSupported: false,
}));

describe('TusClientProvider', () => {
  it('Should output error message if the browser does not supoprted', () => {
    console.error = jest.fn();

    act(() => {
      render(<TusClientProvider />);
    });

    expect(console.error).toHaveBeenCalledWith(
      ERROR_MESSAGES.tusIsNotSupported
    );
  });
});
