import { render, act as renderAct } from '@testing-library/react';
import { renderHook, act as hooksAct } from '@testing-library/react-hooks';
import * as tus from 'tus-js-client';
import { ERROR_MESSAGES, TusClientProvider } from '../TusClientProvider';
import { createConsoleErrorMock } from './utils/mock';
import * as coreTus from '../core/tus';

const actualTus = jest.requireActual<typeof tus>('tus-js-client');

describe('TusClientProvider', () => {
  let useTusHandlerMock: jest.SpyInstance<coreTus.TusHandler, []> | undefined;

  beforeEach(() => {
    useTusHandlerMock?.mockRestore();
  });

  it('Should output error message if the browser does not supoprted', () => {
    beforeEach(() => {
      useTusHandlerMock?.mockClear();
    });

    useTusHandlerMock = jest
      .spyOn(coreTus, 'useTusHandler')
      .mockImplementation(
        () => new coreTus.TusHandler({ ...tus, isSupported: false })
      );

    const consoleErrorMock = createConsoleErrorMock();

    renderAct(() => {
      render(<TusClientProvider />);
    });

    expect(consoleErrorMock).toHaveBeenCalledWith(
      ERROR_MESSAGES.tusIsNotSupported
    );
  });

  describe('Should pass each props', () => {
    it('Nothing to pass', async () => {
      render(<TusClientProvider />);

      hooksAct(() => {
        const { result } = renderHook(() => coreTus.useTusHandler());

        expect(result.current.getTus.canStoreURLs).toBe(actualTus.canStoreURLs);
        expect(result.current.getTus.isSupported).toBe(actualTus.isSupported);
        expect(result.current.getTus.Upload).toBe(actualTus.Upload);
        expect(result.current.getTus.defaultOptions).toBe(
          actualTus.defaultOptions
        );
      });
    });

    it('canStoreURLs', async () => {
      render(<TusClientProvider canStoreURLs={false} />);

      hooksAct(() => {
        const { result } = renderHook(() => coreTus.useTusHandler());

        expect(result.current.getTus.canStoreURLs).toBe(false);
        expect(result.current.getTus.isSupported).toBe(actualTus.isSupported);
        expect(result.current.getTus.Upload).toBe(actualTus.Upload);
        expect(result.current.getTus.defaultOptions).toBe(
          actualTus.defaultOptions
        );
      });
    });

    it('defaultOptions', async () => {
      render(<TusClientProvider defaultOptions={{ endpoint: 'hoge' }} />);

      hooksAct(() => {
        const { result } = renderHook(() => coreTus.useTusHandler());

        expect(result.current.getTus.canStoreURLs).toBe(actualTus.canStoreURLs);
        expect(result.current.getTus.isSupported).toBe(actualTus.isSupported);
        expect(result.current.getTus.Upload).toBe(actualTus.Upload);
        expect(result.current.getTus.defaultOptions.endpoint).toBe('hoge');
      });
    });

    it('All props', async () => {
      render(
        <TusClientProvider
          defaultOptions={{ endpoint: 'hoge' }}
          canStoreURLs={false}
        />
      );

      hooksAct(() => {
        const { result } = renderHook(() => coreTus.useTusHandler());

        expect(result.current.getTus.canStoreURLs).toBe(false);
        expect(result.current.getTus.isSupported).toBe(actualTus.isSupported);
        expect(result.current.getTus.Upload).toBe(actualTus.Upload);
        expect(result.current.getTus.defaultOptions.endpoint).toBe('hoge');
      });
    });
  });
});
