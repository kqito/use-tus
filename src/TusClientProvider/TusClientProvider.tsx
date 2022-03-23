import { useReducer, createElement, FC } from "react";
import {
  TusClientDispatchContext,
  TusClientStateContext,
} from "../core/contexts";

import {
  tusClientInitialState,
  tusClientReducer,
} from "../core/tusClientReducer";
import { TusConfigs, TusHandler } from "../core/tusHandler";
import { TusController } from "./TusController";

export type TusClientProviderProps = Readonly<TusConfigs>;

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

  const tusControllerElement = createElement(
    TusController,
    {
      canStoreURLs,
      defaultOptions,
    },
    children
  );

  const tusClientDispatchContextProviderElement = createElement(
    TusClientDispatchContext.Provider,
    { value: tusClientDispatch },
    tusControllerElement
  );

  return createElement(
    TusClientStateContext.Provider,
    {
      value: tusClientState,
    },
    tusClientDispatchContextProviderElement
  );
};
