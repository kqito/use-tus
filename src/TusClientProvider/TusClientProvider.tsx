import type { FC } from 'react';
import { useReducer } from 'react';
import {
  TusClientDispatchContext,
  TusClientStateContext,
} from '../core/contexts';

import {
  tusClientInitialState,
  tusClientReducer,
} from '../core/tusClientReducer';
import { TusConfigs, TusHandler } from '../core/tusHandler';
import { TusController } from './TusController';

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
