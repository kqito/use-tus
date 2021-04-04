import {
  createContext,
  Dispatch,
  FC,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import { TusClientActions } from './tucClientActions';

import {
  tusClientInitialState,
  tusClientReducer,
  TusClientState,
} from './tusClientReducer';

const TUS_CLIENT_CONTEXT_HAS_NOT_FOUND_ERROR_MESSAGE =
  'No TusClient set, use TusClientProvider to set one';

const TusClientStateContext = createContext<TusClientState | undefined>(
  undefined
);
const TusClientDispatchContext = createContext<
  Dispatch<TusClientActions> | undefined
>(undefined);

export const useTusClientState = () => {
  const tusClientState = useContext(TusClientStateContext);

  if (!tusClientState) {
    throw new Error(TUS_CLIENT_CONTEXT_HAS_NOT_FOUND_ERROR_MESSAGE);
  }

  return useMemo(() => tusClientState, [tusClientState]);
};

export const useTusClientDispatch = () => {
  const tusClientDispatch = useContext(TusClientDispatchContext);

  if (!tusClientDispatch) {
    throw new Error(TUS_CLIENT_CONTEXT_HAS_NOT_FOUND_ERROR_MESSAGE);
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
