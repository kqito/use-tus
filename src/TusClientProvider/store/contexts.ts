import type { Dispatch } from "react";
import { createContext, useContext, useMemo } from "react";
import { ERROR_MESSAGES } from "../constants";
import { TusClientActions } from "./tucClientActions";
import { TusClientState } from "./tusClientReducer";

export const TusClientStateContext = createContext<TusClientState | undefined>(
  undefined
);
export const TusClientDispatchContext = createContext<
  Dispatch<TusClientActions> | undefined
>(undefined);

export const useTusClientState = () => {
  const tusClientState = useContext(TusClientStateContext);

  if (!tusClientState && process.env.NODE_ENV !== "production") {
    throw new Error(ERROR_MESSAGES.tusClientHasNotFounded);
  }

  return useMemo(() => tusClientState as TusClientState, [tusClientState]);
};

export const useTusClientDispatch = () => {
  const tusClientDispatch = useContext(TusClientDispatchContext);

  if (!tusClientDispatch && process.env.NODE_ENV !== "production") {
    throw new Error(ERROR_MESSAGES.tusClientHasNotFounded);
  }

  return useMemo(() => tusClientDispatch as Dispatch<TusClientActions>, [
    tusClientDispatch,
  ]);
};
