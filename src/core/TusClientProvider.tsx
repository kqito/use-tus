import {
  createContext,
  Dispatch,
  FC,
  useContext,
  useMemo,
  useReducer,
} from 'react';

import {
  tusClientInitialState,
  tusClientReducer,
  TusClientState,
  TusClientActions,
} from './tusClientReducer';

const TusClientStateContext = createContext<TusClientState | undefined>(
  undefined
);
const TusClientDispatchContext = createContext<
  Dispatch<TusClientActions> | undefined
>(undefined);

export const useTusClientState = () => {
  const tusClientState = useContext(TusClientStateContext);

  if (!tusClientState) {
    throw new Error('No TusClient set, use TusClientProvider to set one');
  }

  return useMemo(() => tusClientState, [tusClientState]);
};

export const useTusClientDispatch = () => {
  const tusClientDispatch = useContext(TusClientDispatchContext);

  if (!tusClientDispatch) {
    throw new Error('No TusClient set, use TusClientProvider to set one');
  }

  return useMemo(() => tusClientDispatch, [tusClientDispatch]);
};

export const TusClientProvider: FC = ({ children }) => {
  const [tusClientState, tusClientDispatch] = useReducer(
    tusClientReducer,
    tusClientInitialState
  );

  return (
    <TusClientStateContext.Provider value={tusClientState}>
      <TusClientDispatchContext.Provider value={tusClientDispatch}>
        {children}
      </TusClientDispatchContext.Provider>
    </TusClientStateContext.Provider>
  );
};
