import type { FC } from 'react';
import { useEffect, useReducer } from 'react';
import type { UploadOptions } from 'tus-js-client';
import { ERROR_MESSAGES } from './core/constants';
import {
  TusClientDispatchContext,
  TusClientStateContext,
} from './core/contexts';
import { useTusHandler } from './core/tusHandler';

import {
  tusClientInitialState,
  tusClientReducer,
} from './core/tusClientReducer';

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
  const tusHandler = useTusHandler();
  const [tusClientState, tusClientDispatch] = useReducer(
    tusClientReducer,
    tusClientInitialState
  );

  useEffect(() => {
    if (
      !tusHandler.getTus.isSupported &&
      process.env.NODE_ENV !== 'production'
    ) {
      // eslint-disable-next-line no-console
      console.error(ERROR_MESSAGES.tusIsNotSupported);
    }
  }, [tusHandler]);

  useEffect(() => {
    if (canStoreURLs === undefined) {
      return;
    }

    tusHandler.setCanStoreURLs = canStoreURLs;
  }, [canStoreURLs, tusHandler]);

  useEffect(() => {
    if (defaultOptions === undefined) {
      return;
    }

    tusHandler.setDefaultOptions = defaultOptions;
  }, [defaultOptions, tusHandler]);

  useEffect(
    () => () => {
      tusHandler.reset();
    },
    [tusHandler]
  );

  return (
    <TusClientStateContext.Provider value={tusClientState}>
      <TusClientDispatchContext.Provider value={tusClientDispatch}>
        {children}
      </TusClientDispatchContext.Provider>
    </TusClientStateContext.Provider>
  );
};
