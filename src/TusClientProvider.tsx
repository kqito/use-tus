import type { FC, Dispatch } from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { isSupported } from 'tus-js-client';
import type { UploadOptions } from 'tus-js-client';
import type { TusClientActions } from './core/tucClientActions';
import { useTusHandler } from './core/tus';

import {
  tusClientInitialState,
  tusClientReducer,
  TusClientState,
} from './core/tusClientReducer';

export const ERROR_MESSAGES = {
  tusClientHasNotFounded: 'No TusClient set, use TusClientProvider to set one',
  tusIsNotSupported:
    'This browser does not support uploads. Please use a modern browser instead.',
};

const TusClientStateContext = createContext<TusClientState | undefined>(
  undefined
);
const TusClientDispatchContext = createContext<
  Dispatch<TusClientActions> | undefined
>(undefined);

export const useTusClientState = () => {
  const tusClientState = useContext(TusClientStateContext);

  if (!tusClientState) {
    throw new Error(ERROR_MESSAGES.tusClientHasNotFounded);
  }

  return useMemo(() => tusClientState, [tusClientState]);
};

export const useTusClientDispatch = () => {
  const tusClientDispatch = useContext(TusClientDispatchContext);

  if (!tusClientDispatch) {
    throw new Error(ERROR_MESSAGES.tusClientHasNotFounded);
  }

  return useMemo(() => tusClientDispatch, [tusClientDispatch]);
};

type TusClientProviderProps = Readonly<
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
    if (!isSupported && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(ERROR_MESSAGES.tusIsNotSupported);
    }
  }, []);

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
