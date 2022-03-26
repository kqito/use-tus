import { isSupported } from "tus-js-client";
import { useReducer, createElement, FC, useEffect } from "react";
import { DefaultOptions } from "./types";
import {
  TusClientDispatchContext,
  TusClientStateContext,
} from "./store/contexts";
import { updateDefaultOptions } from "./store/tucClientActions";
import {
  tusClientReducer,
  tusClientInitialState,
} from "./store/tusClientReducer";
import { ERROR_MESSAGES } from "./constants";

export type TusClientProviderProps = Readonly<{
  defaultOptions?: DefaultOptions;
}>;

export const TusClientProvider: FC<TusClientProviderProps> = ({
  defaultOptions,
  children,
}) => {
  const [tusClientState, tusClientDispatch] = useReducer(tusClientReducer, {
    ...tusClientInitialState,
    defaultOptions,
  });

  // Output error if tus has not supported
  useEffect(() => {
    if (isSupported || process.env.NODE_ENV === "production") {
      return;
    }

    // eslint-disable-next-line no-console
    console.error(ERROR_MESSAGES.tusIsNotSupported);
  }, []);

  // Set defaultOptions to the context
  useEffect(() => {
    if (tusClientState.defaultOptions === defaultOptions) {
      return;
    }

    tusClientDispatch(updateDefaultOptions(defaultOptions));
  }, [defaultOptions, tusClientState.defaultOptions]);

  const tusClientDispatchContextProviderElement = createElement(
    TusClientDispatchContext.Provider,
    { value: tusClientDispatch },
    children
  );

  return createElement(
    TusClientStateContext.Provider,
    {
      value: tusClientState,
    },
    tusClientDispatchContextProviderElement
  );
};
