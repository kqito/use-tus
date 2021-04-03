import { useCallback, useMemo } from 'react';
import { Upload } from 'tus-js-client';
import { useTusClientState, useTusClientDispatch } from './TusClientProvider';
import {
  errorUpload,
  insertUploadInstance,
  removeUploadInstance,
  successUpload,
} from './tusClientReducer';

export const useTus = (uploadKey: string) => {
  const tusClientState = useTusClientState();
  const tusClientDispatch = useTusClientDispatch();
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
      if (!tusClientDispatch) {
        return;
      }

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
          new Upload(file, {
            ...options,
            onSuccess,
            onError,
          })
        )
      );
    },
    [tusClientDispatch, uploadKey]
  );

  const remove = useCallback(() => {
    tusClientDispatch(removeUploadInstance(uploadKey));
  }, [tusClientDispatch, uploadKey]);

  return { upload, setUpload, remove, isSuccess, error };
};
