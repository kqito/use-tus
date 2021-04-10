import { FC, useEffect } from 'react';
import { ERROR_MESSAGES } from './constants';
import { updateTusHandlerOptions } from './tucClientActions';
import { useTusClientDispatch, useTusClientState } from './tusContexts';
import { TusConfigs } from './tusHandler';

export type TusControllerProps = Readonly<TusConfigs>;

export const TusController: FC<TusControllerProps> = ({
  canStoreURLs,
  defaultOptions,
  children,
}) => {
  const { tusHandler } = useTusClientState();
  const tus = tusHandler.getTus;
  const tusClientDispatch = useTusClientDispatch();

  useEffect(() => {
    if (
      tusHandler.getTus.isSupported ||
      process.env.NODE_ENV === 'production'
    ) {
      return;
    }

    // eslint-disable-next-line no-console
    console.error(ERROR_MESSAGES.tusIsNotSupported);
  }, [tusHandler.getTus.isSupported]);

  useEffect(() => {
    if (
      tus.defaultOptions === defaultOptions &&
      tus.canStoreURLs === canStoreURLs
    ) {
      return;
    }

    tusClientDispatch(
      updateTusHandlerOptions({ canStoreURLs, defaultOptions })
    );
  }, [
    tusClientDispatch,
    canStoreURLs,
    defaultOptions,
    tus.canStoreURLs,
    tus.defaultOptions,
  ]);

  return <>{children}</>;
};
