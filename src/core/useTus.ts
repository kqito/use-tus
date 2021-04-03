import { useCallback, useMemo } from 'react';
import { Upload } from 'tus-js-client';
import { useTusClientState, useTusClientDispatch } from './TusClientProvider';
import { insertUploadInstance, removeUploadInstance } from './tusClientReducer';

export const useTus = (uploadKey: string) => {
  const tusClientState = useTusClientState();
  const tusClientDispatch = useTusClientDispatch();
  const upload = useMemo(() => tusClientState.uploads[uploadKey], [
    tusClientState,
    uploadKey,
  ]);

  const setUpload = useCallback(
    (file: Upload['file'], options: Upload['options']) => {
      if (!tusClientDispatch) {
        return;
      }

      tusClientDispatch(
        insertUploadInstance(uploadKey, new Upload(file, options))
      );
    },
    [tusClientDispatch, uploadKey]
  );

  const remove = useCallback(() => {
    tusClientDispatch(removeUploadInstance(uploadKey));
  }, [tusClientDispatch, uploadKey]);

  return { upload, setUpload, remove };
};
