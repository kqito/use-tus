import { render, act } from '@testing-library/react';
import { ERROR_MESSAGES, TusClientProvider } from '../core/TusClientProvider';
import { createConsoleErrorMock } from './utils/mock';

/* eslint-disable no-console */

jest.mock('tus-js-client', () => ({
  isSupported: false,
}));

describe('TusClientProvider', () => {
  it('Should output error message if the browser does not supoprted', () => {
    const consoleErrorMock = createConsoleErrorMock();

    act(() => {
      render(<TusClientProvider />);
    });

    expect(consoleErrorMock).toHaveBeenCalledWith(
      ERROR_MESSAGES.tusIsNotSupported
    );
  });
});
