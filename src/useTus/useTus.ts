import { useCallback, useMemo, useState, useEffect } from 'react';
import { useTusClientDispatch, useTusClientState } from '../core/contexts';
import {
  insertUploadInstance,
  removeUploadInstance,
} from '../core/tucClientActions';
import { UseTusOptions, UseTusResult, UseTusState } from './types';
import { createHandler, startOrResumeUpload } from './utils';

const defaultUseTusOptionsValue: UseTusOptions = {
  cacheKey: undefined,
  autoAbort: true,
  autoStart: false,
};

const initialUseTusState: UseTusState = {
  upload: undefined,
  isSuccess: false,
  error: undefined,
};

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
      const { onSuccess, onError } = createHandler({
        handlers: {
          onError: options.onError,
          onSuccess: options.onSuccess,
        },
        cacheKey,
        dispatch: tusClientDispatch,
        internalDispatch: setInternalTusState,
      });

      const upload = new tus.Upload(file, {
        ...tus.defaultOptions,
        ...options,
        onSuccess,
        onError,
      });

      if (autoStart) {
        startOrResumeUpload(upload);
      }

      if (cacheKey) {
        tusClientDispatch(insertUploadInstance(cacheKey, upload));
        return;
      }

      setInternalTusState({
        ...internalTusState,
        upload,
      });
    },
    [tusClientDispatch, cacheKey, tus, internalTusState, autoStart]
  );

  const remove = useCallback(() => {
    if (!cacheKey) {
      setInternalTusState(initialUseTusState);
      return;
    }

    tusClientDispatch(removeUploadInstance(cacheKey));
  }, [tusClientDispatch, cacheKey]);

  const tusResult: UseTusResult = useMemo(() => {
    const targetState = cacheKey
      ? tusClientState.uploads[cacheKey]
      : internalTusState;

    return {
      upload: targetState?.upload,
      isSuccess: targetState?.isSuccess ?? false,
      error: targetState?.error,
      setUpload,
      remove,
    };
  }, [setUpload, remove, cacheKey, internalTusState, tusClientState]);

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
