import type { FC } from 'react';
import { useEffect, useReducer } from 'react';
import type { UploadOptions } from 'tus-js-client';
import { ERROR_MESSAGES } from './core/constants';
import {
  TusClientDispatchContext,
  TusClientStateContext,
  useTusClientDispatch,
  useTusClientState,
} from './core/tusContexts';
import { updateTusHandlerOptions } from './core/tucClientActions';

import {
  tusClientInitialState,
  tusClientReducer,
} from './core/tusClientReducer';
import { TusHandler } from './core/tusHandler';

export type TusClientProviderProps = Readonly<
  Partial<{
    canStoreURLs: boolean;
    defaultOptions: UploadOptions;
  }>
>;

export const TusClientProvider: FC<TusClientProviderProps> = ({
  canStoreURLs,
  defaultOptions,
  children,
}) => {
  const [tusClientState, tusClientDispatch] = useReducer(tusClientReducer, {
    ...tusClientInitialState,
    tusHandler: new TusHandler({
      canStoreURLs,
      defaultOptions,
    }),
  });

  return (
    <TusClientStateContext.Provider value={tusClientState}>
      <TusClientDispatchContext.Provider value={tusClientDispatch}>
        <TusController
          canStoreURLs={canStoreURLs}
          defaultOptions={defaultOptions}
        >
          {children}
        </TusController>
      </TusClientDispatchContext.Provider>
    </TusClientStateContext.Provider>
  );
};

const TusController: FC<TusClientProviderProps> = ({
  canStoreURLs,
  defaultOptions,
  children,
}) => {
  const { tusHandler } = useTusClientState();
  const tus = tusHandler.getTus;
  const tusClientDispatch = useTusClientDispatch();

  useEffect(() => {
    if (
      tusHandler.getTus.isSupported ||
      process.env.NODE_ENV === 'production'
    ) {
      return;
    }

    // eslint-disable-next-line no-console
    console.error(ERROR_MESSAGES.tusIsNotSupported);
  }, [tusHandler.getTus.isSupported]);

  useEffect(() => {
    if (
      tus.defaultOptions === defaultOptions &&
      tus.canStoreURLs === canStoreURLs
    ) {
      return;
    }

    tusClientDispatch(
      updateTusHandlerOptions({ canStoreURLs, defaultOptions })
    );
  }, [
    tusClientDispatch,
    canStoreURLs,
    defaultOptions,
    tus.canStoreURLs,
    tus.defaultOptions,
  ]);

  return <>{children}</>;
};
