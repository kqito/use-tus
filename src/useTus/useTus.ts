import { useCallback, useMemo, useState } from 'react';
import type { Upload } from 'tus-js-client';
import { initialUseTusState } from './options';
import { UseTusOptions, UseTusResult, UseTusState } from './types';
import { createUpload, DispatchIsAborted } from './utils/createUpload';
import { startOrResumeUpload } from './utils/startOrResumeUpload';
import { useAutoAbort } from './utils/useAutoAbort';
import { useMergeTusOptions } from './utils/useMergeTusOptions';

export const useTus = (baseOption?: UseTusOptions): UseTusResult => {
  const { autoAbort, autoStart, uploadOptions } = useMergeTusOptions(
    baseOption
  );
  const [tusState, setTusState] = useState<UseTusState>(initialUseTusState);

  const updateTusState = useCallback((newOptions: Partial<UseTusState>) => {
    setTusState((tus) => ({
      ...tus,
      ...newOptions,
    }));
  }, []);

  const setUpload: UseTusResult['setUpload'] = useCallback(
    (file, options = {}) => {
      const targetOptions = {
        ...uploadOptions,
        ...options,
      };

      const onSuccess = () => {
        updateTusState({ isSuccess: true });
        targetOptions?.onSuccess?.();
      };

      const onError = (error: Error) => {
        updateTusState({ error });
        targetOptions?.onError?.(error);
      };

      const mergedUploadOptions: Upload['options'] = {
        ...targetOptions,
        onSuccess,
        onError,
      };

      const dispatchIsAborted: DispatchIsAborted = (isAborted) => {
        updateTusState({ isAborted });
      };
      const upload = createUpload(file, mergedUploadOptions, dispatchIsAborted);

      if (autoStart) {
        startOrResumeUpload(upload);
      }

      updateTusState({ upload });
    },
    [autoStart, updateTusState, uploadOptions]
  );

  const remove = useCallback(() => {
    tusState?.upload?.abort();
    setTusState(initialUseTusState);
  }, [tusState?.upload]);

  const tusResult: UseTusResult = useMemo(
    () => ({
      upload: tusState?.upload,
      isSuccess: tusState?.isSuccess ?? false,
      error: tusState?.error,
      isAborted: tusState?.isAborted ?? false,
      setUpload,
      remove,
    }),
    [tusState, setUpload, remove]
  );

  useAutoAbort(tusResult.upload, autoAbort ?? false);

  return tusResult;
};
