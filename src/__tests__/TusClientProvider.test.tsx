import { render, act as renderAct } from '@testing-library/react';
import {
  renderHook,
  act as hooksAct,
  cleanup,
} from '@testing-library/react-hooks';
import type { ReactNode } from 'react';
import { TusClientProvider } from '../TusClientProvider';
import { createConsoleErrorMock } from './utils/mock';
import * as tusContexts from '../core/contexts';
import { ERROR_MESSAGES } from '../core/constants';
import { TusClientState } from '../core/tusClientReducer';
import { TusConfigs, TusHandler } from '../core/tusHandler';

const actualTus = jest.requireActual<typeof import('tus-js-client')>(
  'tus-js-client'
);

describe('TusClientProvider', () => {
  let useTusHandlerMock: jest.SpyInstance<TusClientState, []> | undefined;

  beforeEach(() => {
    useTusHandlerMock?.mockRestore();
    cleanup();
  });

  it('Should output error message if the browser does not supoprted', () => {
    beforeEach(() => {
      useTusHandlerMock?.mockClear();
    });

    useTusHandlerMock = jest
      .spyOn(tusContexts, 'useTusClientState')
      .mockImplementation(() => ({
        uploads: {},
        tusHandler: {
          getTus: { ...actualTus, isSupported: false },
        } as TusHandler,
      }));

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
      const { result } = renderHook(() => tusContexts.useTusClientState(), {
        wrapper: ({ children }) => (
          <TusClientProvider>{children}</TusClientProvider>
        ),
      });

      expect(result.current.tusHandler.getTus.canStoreURLs).toBe(
        actualTus.canStoreURLs
      );
      expect(result.current.tusHandler.getTus.isSupported).toBe(
        actualTus.isSupported
      );
      expect(result.current.tusHandler.getTus.Upload).toBe(actualTus.Upload);
      expect(result.current.tusHandler.getTus.defaultOptions).toBe(
        actualTus.defaultOptions
      );
    });

    it('canStoreURLs', async () => {
      hooksAct(() => {
        const { result } = renderHook(() => tusContexts.useTusClientState(), {
          wrapper: ({ children }) => (
            <TusClientProvider canStoreURLs={false}>
              {children}
            </TusClientProvider>
          ),
        });

        expect(result.current.tusHandler.getTus.canStoreURLs).toBe(false);
        expect(result.current.tusHandler.getTus.isSupported).toBe(
          actualTus.isSupported
        );
        expect(result.current.tusHandler.getTus.Upload).toBe(actualTus.Upload);
        expect(result.current.tusHandler.getTus.defaultOptions).toBe(
          actualTus.defaultOptions
        );
      });
    });

    it('defaultOptions', async () => {
      hooksAct(() => {
        const { result } = renderHook(() => tusContexts.useTusClientState(), {
          wrapper: ({ children }) => (
            <TusClientProvider defaultOptions={{ endpoint: 'hoge' }}>
              {children}
            </TusClientProvider>
          ),
        });

        expect(result.current.tusHandler.getTus.canStoreURLs).toBe(
          actualTus.canStoreURLs
        );
        expect(result.current.tusHandler.getTus.isSupported).toBe(
          actualTus.isSupported
        );
        expect(result.current.tusHandler.getTus.Upload).toBe(actualTus.Upload);
        expect(result.current.tusHandler.getTus.defaultOptions.endpoint).toBe(
          'hoge'
        );
      });
    });

    it('All props', async () => {
      hooksAct(() => {
        const { result } = renderHook(() => tusContexts.useTusClientState(), {
          wrapper: ({ children }) => (
            <TusClientProvider
              canStoreURLs={false}
              defaultOptions={{ endpoint: 'hoge' }}
            >
              {children}
            </TusClientProvider>
          ),
        });

        expect(result.current.tusHandler.getTus.canStoreURLs).toBe(false);
        expect(result.current.tusHandler.getTus.isSupported).toBe(
          actualTus.isSupported
        );
        expect(result.current.tusHandler.getTus.Upload).toBe(actualTus.Upload);
        expect(result.current.tusHandler.getTus.defaultOptions.endpoint).toBe(
          'hoge'
        );
      });
    });

    it('Change props', async () => {
      const { result, rerender } = renderHook(
        () => tusContexts.useTusClientState(),
        {
          wrapper: ({
            children,
            canStoreURLs,
            defaultOptions,
          }: TusConfigs & { children?: ReactNode }) => (
            <TusClientProvider
              canStoreURLs={canStoreURLs}
              defaultOptions={defaultOptions}
            >
              {children}
            </TusClientProvider>
          ),
        }
      );

      expect(result.current.tusHandler.getTus.canStoreURLs).toBe(
        actualTus.canStoreURLs
      );
      expect(result.current.tusHandler.getTus.isSupported).toBe(
        actualTus.isSupported
      );
      expect(result.current.tusHandler.getTus.Upload).toBe(actualTus.Upload);
      expect(result.current.tusHandler.getTus.defaultOptions).toBe(
        actualTus.defaultOptions
      );

      rerender({
        canStoreURLs: false,
        defaultOptions: { endpoint: 'fuga' },
      });

      expect(result.current.tusHandler.getTus.canStoreURLs).toBe(false);
      expect(result.current.tusHandler.getTus.isSupported).toBe(
        actualTus.isSupported
      );
      expect(result.current.tusHandler.getTus.Upload).toBe(actualTus.Upload);
      expect(result.current.tusHandler.getTus.defaultOptions.endpoint).toBe(
        'fuga'
      );
    });
  });
});
