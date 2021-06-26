import { SetStateAction } from 'react';
import { Upload } from 'tus-js-client';
import {
  updateErrorUpload,
  updateSuccessUpload,
  TusClientActions,
  updateIsAbortedUpload,
} from '../core/tucClientActions';
import { UseTusOptions, UseTusState } from './types';

export type Dispatcher = {
  dispatch: (value: TusClientActions) => void;
  internalDispatch: (value: SetStateAction<UseTusState>) => void;
  cacheKey: UseTusOptions['cacheKey'];
};
type OptionHandler = Pick<Upload['options'], 'onError' | 'onSuccess'>;
type CreateUpload = (
  file: Upload['file'],
  options: Upload['options'],
  dispatcher: Dispatcher
) => Upload;
type CreateOptionHandler = (
  handlers: OptionHandler,
  dispatcher: Dispatcher
) => OptionHandler;

export const createOptionHandler: CreateOptionHandler = (
  handlers,
  { dispatch, internalDispatch, cacheKey }
) => {
  const onSuccess = () => {
    if (cacheKey) {
      dispatch(updateSuccessUpload(cacheKey));
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
      dispatch(updateErrorUpload(cacheKey, err));
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

export const createUpload: CreateUpload = (
  file,
  options,
  { dispatch, internalDispatch, cacheKey }
) => {
  const upload = new Upload(file, options);
  const originalStart = upload.start.bind(upload);
  const originalAbort = upload.abort.bind(upload);

  const dispatchIsAborted = (isAborted: boolean) => {
    if (cacheKey) {
      dispatch(updateIsAbortedUpload(cacheKey, isAborted));
      return;
    }

    internalDispatch((internalTusState) => ({
      ...internalTusState,
      isAborted,
    }));
  };

  const start = () => {
    originalStart();
    dispatchIsAborted(false);
  };

  const abort = async () => {
    originalAbort();
    dispatchIsAborted(true);
  };

  upload.start = start;
  upload.abort = abort;

  return upload;
};
