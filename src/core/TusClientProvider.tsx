import {
  createContext,
  Dispatch,
  FC,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { isSupported } from 'tus-js-client';
import { TusClientActions } from './tucClientActions';

import {
  tusClientInitialState,
  tusClientReducer,
  TusClientState,
} from './tusClientReducer';

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

export const TusClientProvider: FC = ({ children }) => {
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

  return (
    <TusClientStateContext.Provider value={tusClientState}>
      <TusClientDispatchContext.Provider value={tusClientDispatch}>
        {children}
      </TusClientDispatchContext.Provider>
    </TusClientStateContext.Provider>
  );
};
