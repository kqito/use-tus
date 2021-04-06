import type { Dispatch } from 'react';
import { createContext, useContext, useMemo } from 'react';
import { ERROR_MESSAGES } from './constants';
import { TusClientActions } from './tucClientActions';
import { TusClientState } from './tusClientReducer';

export const TusClientStateContext = createContext<TusClientState | undefined>(
  undefined
);
export const TusClientDispatchContext = createContext<
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
