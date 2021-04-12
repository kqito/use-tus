import { useCallback, useMemo } from 'react';
import type { Upload } from 'tus-js-client';
import { useTusClientDispatch, useTusClientState } from './core/tusContexts';
import {
  errorUpload,
  insertUploadInstance,
  removeUploadInstance,
  successUpload,
} from './core/tucClientActions';
import { createUid } from './utils/uid';

export type TusResult = {
  upload?: Upload;
  setUpload: (file: Upload['file'], options?: Upload['options']) => void;
  remove: () => void;
  isSuccess: boolean;
  error?: Error;
};

export const useTus = (cacheKey?: string): TusResult => {
  const internalCacheKey = useMemo(() => cacheKey || createUid(), [cacheKey]);
  const tusClientState = useTusClientState();
  const tusClientDispatch = useTusClientDispatch();
  const tus = tusClientState.tusHandler.getTus;
  const uploadState = useMemo(() => tusClientState.uploads[internalCacheKey], [
    tusClientState,
    internalCacheKey,
  ]);
  const upload = useMemo(() => uploadState?.upload, [uploadState]);
  const isSuccess = useMemo(() => uploadState?.isSuccess ?? false, [
    uploadState,
  ]);
  const error = useMemo(() => uploadState?.error, [uploadState]);

  const setUpload: TusResult['setUpload'] = useCallback(
    (file, options = {}) => {
      const onSuccess = () => {
        tusClientDispatch(successUpload(internalCacheKey));

        if (options.onSuccess) {
          options.onSuccess();
        }
      };

      const onError = (err: Error) => {
        tusClientDispatch(errorUpload(internalCacheKey, err));

        if (options.onError) {
          options.onError(err);
        }
      };

      tusClientDispatch(
        insertUploadInstance(
          internalCacheKey,
          new tus.Upload(file, {
            ...tus.defaultOptions,
            ...options,
            onSuccess,
            onError,
          })
        )
      );
    },
    [tusClientDispatch, internalCacheKey, tus]
  );

  const remove = useCallback(() => {
    tusClientDispatch(removeUploadInstance(internalCacheKey));
  }, [tusClientDispatch, internalCacheKey]);

  return useMemo(() => ({ upload, setUpload, remove, isSuccess, error }), [
    upload,
    setUpload,
    remove,
    isSuccess,
    error,
  ]);
};
