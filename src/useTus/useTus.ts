import { useCallback, useMemo, useState, useEffect } from 'react';
import type { Upload } from 'tus-js-client';
import { useTusClientDispatch, useTusClientState } from '../core/contexts';
import {
  insertUploadInstance,
  removeUploadInstance,
} from '../core/tucClientActions';
import { UseTusOptions, UseTusResult, UseTusState } from './types';
import {
  createOptionHandler,
  createUpload,
  Dispatcher,
  startOrResumeUpload,
} from './utils';

const defaultUseTusOptionsValue: Readonly<UseTusOptions> = Object.freeze<UseTusOptions>(
  {
    cacheKey: undefined,
    autoAbort: true,
    autoStart: false,
  }
);

const initialUseTusState: Readonly<UseTusState> = Object.freeze<UseTusState>({
  upload: undefined,
  isSuccess: false,
  isAborted: false,
  error: undefined,
});

export const useTus = (useTusOptions?: UseTusOptions): UseTusResult => {
  const { cacheKey, autoAbort, autoStart } = {
    ...defaultUseTusOptionsValue,
    ...(useTusOptions || {}),
  };
  const [internalTusState, setInternalTusState] = useState<UseTusState>(
    initialUseTusState
  );
  const tusClientState = useTusClientState();
  const tusClientDispatch = useTusClientDispatch();
  const tus = tusClientState.tusHandler.getTus;

  const setUpload: UseTusResult['setUpload'] = useCallback(
    (file, options = {}) => {
      const dispatcher: Dispatcher = {
        cacheKey,
        dispatch: tusClientDispatch,
        internalDispatch: setInternalTusState,
      };
      const { onSuccess, onError } = createOptionHandler(
        {
          onError: options.onError,
          onSuccess: options.onSuccess,
        },
        dispatcher
      );
      const uploadOptions: Upload['options'] = {
        ...tus.defaultOptions,
        ...options,
        onSuccess,
        onError,
      };

      const upload = createUpload(file, uploadOptions, dispatcher);

      if (autoStart) {
        startOrResumeUpload(upload);
      }

      if (cacheKey) {
        tusClientDispatch(insertUploadInstance(cacheKey, upload));
        return;
      }

      setInternalTusState({
        ...initialUseTusState,
        upload,
      });
    },
    [tusClientDispatch, cacheKey, tus, autoStart]
  );

  const targetTusState = useMemo(
    () => (cacheKey ? tusClientState.uploads[cacheKey] : internalTusState),
    [cacheKey, tusClientState, internalTusState]
  );

  const remove = useCallback(() => {
    targetTusState?.upload?.abort();

    if (!cacheKey) {
      setInternalTusState(initialUseTusState);
      return;
    }

    tusClientDispatch(removeUploadInstance(cacheKey));
  }, [targetTusState, tusClientDispatch, cacheKey]);

  const tusResult: UseTusResult = useMemo(
    () => ({
      upload: targetTusState?.upload,
      isSuccess: targetTusState?.isSuccess ?? false,
      error: targetTusState?.error,
      isAborted: targetTusState?.isAborted ?? false,
      setUpload,
      remove,
    }),
    [targetTusState, setUpload, remove]
  );

  // For autoAbort option
  useEffect(() => {
    const abortUploading = async () => {
      if (!tusResult.upload) {
        return;
      }

      await tusResult.upload.abort();
    };

    return () => {
      if (!autoAbort) {
        return;
      }

      abortUploading();
    };
  }, [autoAbort, tusResult.upload]);

  return tusResult;
};
