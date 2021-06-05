import { SetStateAction } from 'react';
import type { Upload } from 'tus-js-client';
import {
  errorUpload,
  successUpload,
  TusClientActions,
} from '../core/tucClientActions';
import { UseTusOptions, UseTusState } from './types';

type Handlers = Pick<Upload['options'], 'onError' | 'onSuccess'>;
type CreateHandlerArgs = {
  handlers: Handlers;
  dispatch: (value: TusClientActions) => void;
  internalDispatch: (value: SetStateAction<UseTusState>) => void;
  cacheKey: UseTusOptions['cacheKey'];
};

export const createHandler = ({
  handlers,
  dispatch,
  internalDispatch,
  cacheKey,
}: CreateHandlerArgs): Handlers => {
  const onSuccess = () => {
    if (cacheKey) {
      dispatch(successUpload(cacheKey));
    }

    if (!cacheKey) {
      internalDispatch((internalTusState) => ({
        ...internalTusState,
        isSuccess: true,
      }));
    }

    if (handlers.onSuccess) {
      handlers.onSuccess();
    }
  };

  const onError = (err: Error) => {
    if (cacheKey) {
      dispatch(errorUpload(cacheKey, err));
    }

    if (!cacheKey) {
      internalDispatch((internalTusState) => ({
        ...internalTusState,
        error: err,
      }));
    }

    if (handlers.onError) {
      handlers.onError(err);
    }
  };

  return {
    onSuccess,
    onError,
  };
};

export const startOrResumeUpload = (upload: Upload): void => {
  upload.findPreviousUploads().then((previousUploads) => {
    if (previousUploads.length) {
      upload.resumeFromPreviousUpload(previousUploads[0]);
    }

    upload.start();
  });
};
