import { useCallback, useMemo } from 'react';
import type { Upload } from 'tus-js-client';
import { useTusClientDispatch, useTusClientState } from './core/tusContexts';
import {
  errorUpload,
  insertUploadInstance,
  removeUploadInstance,
  successUpload,
} from './core/tucClientActions';

export const useTus = (uploadKey: string) => {
  const tusClientState = useTusClientState();
  const tusClientDispatch = useTusClientDispatch();
  const tus = tusClientState.tusHandler.getTus;
  const uploadState = useMemo(() => tusClientState.uploads[uploadKey], [
    tusClientState,
    uploadKey,
  ]);
  const upload = useMemo(() => uploadState?.upload, [uploadState]);
  const isSuccess = useMemo(() => uploadState?.isSuccess ?? false, [
    uploadState,
  ]);
  const error = useMemo(() => uploadState?.error, [uploadState]);

  const setUpload = useCallback(
    (file: Upload['file'], options: Upload['options']) => {
      const onSuccess = () => {
        tusClientDispatch(successUpload(uploadKey));

        if (options.onSuccess) {
          options.onSuccess();
        }
      };

      const onError = (err: Error) => {
        tusClientDispatch(errorUpload(uploadKey, err));

        if (options.onError) {
          options.onError(err);
        }
      };

      tusClientDispatch(
        insertUploadInstance(
          uploadKey,
          new tus.Upload(file, {
            ...tus.defaultOptions,
            ...options,
            onSuccess,
            onError,
          })
        )
      );
    },
    [tusClientDispatch, uploadKey, tus]
  );

  const remove = useCallback(() => {
    tusClientDispatch(removeUploadInstance(uploadKey));
  }, [tusClientDispatch, uploadKey]);

  return { upload, setUpload, remove, isSuccess, error };
};
