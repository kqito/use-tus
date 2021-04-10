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

export const useTus = (uploadKey?: string) => {
  const internalUploadKey = useMemo(() => uploadKey || createUid(), [
    uploadKey,
  ]);
  const tusClientState = useTusClientState();
  const tusClientDispatch = useTusClientDispatch();
  const tus = tusClientState.tusHandler.getTus;
  const uploadState = useMemo(() => tusClientState.uploads[internalUploadKey], [
    tusClientState,
    internalUploadKey,
  ]);
  const upload = useMemo(() => uploadState?.upload, [uploadState]);
  const isSuccess = useMemo(() => uploadState?.isSuccess ?? false, [
    uploadState,
  ]);
  const error = useMemo(() => uploadState?.error, [uploadState]);

  const setUpload = useCallback(
    (file: Upload['file'], options: Upload['options']) => {
      const onSuccess = () => {
        tusClientDispatch(successUpload(internalUploadKey));

        if (options.onSuccess) {
          options.onSuccess();
        }
      };

      const onError = (err: Error) => {
        tusClientDispatch(errorUpload(internalUploadKey, err));

        if (options.onError) {
          options.onError(err);
        }
      };

      tusClientDispatch(
        insertUploadInstance(
          internalUploadKey,
          new tus.Upload(file, {
            ...tus.defaultOptions,
            ...options,
            onSuccess,
            onError,
          })
        )
      );
    },
    [tusClientDispatch, internalUploadKey, tus]
  );

  const remove = useCallback(() => {
    tusClientDispatch(removeUploadInstance(internalUploadKey));
  }, [tusClientDispatch, internalUploadKey]);

  return useMemo(() => ({ upload, setUpload, remove, isSuccess, error }), [
    upload,
    setUpload,
    remove,
    isSuccess,
    error,
  ]);
};
