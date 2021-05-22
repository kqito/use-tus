import { useCallback, useMemo, useState, useEffect } from 'react';
import { Upload } from 'tus-js-client';
import { useTusClientDispatch, useTusClientState } from '../core/contexts';
import {
  errorUpload,
  insertUploadInstance,
  removeUploadInstance,
  successUpload,
} from '../core/tucClientActions';

export type UseTusOptions = {
  cacheKey?: string;
  autoAbort?: boolean;
};
export type UseTusResult = {
  upload?: Upload;
  setUpload: (file: Upload['file'], options?: Upload['options']) => void;
  remove: () => void;
  isSuccess: boolean;
  error?: Error;
};
type UseTusState = Pick<UseTusResult, 'upload' | 'isSuccess' | 'error'>;

const defaultUseTusOptionsValue: UseTusOptions = {
  cacheKey: undefined,
  autoAbort: true,
};

const initialUseTusState: UseTusState = {
  upload: undefined,
  isSuccess: false,
  error: undefined,
};

export const useTus = (useTusOptions?: UseTusOptions): UseTusResult => {
  const { cacheKey, autoAbort } = {
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
      const onSuccess = () => {
        if (cacheKey) {
          tusClientDispatch(successUpload(cacheKey));
        }

        if (!cacheKey) {
          setInternalTusState({
            ...internalTusState,
            isSuccess: true,
          });
        }

        if (options.onSuccess) {
          options.onSuccess();
        }
      };

      const onError = (err: Error) => {
        if (cacheKey) {
          tusClientDispatch(errorUpload(cacheKey, err));
        }

        if (!cacheKey) {
          setInternalTusState({
            ...internalTusState,
            error: err,
          });
        }

        if (options.onError) {
          options.onError(err);
        }
      };

      if (cacheKey) {
        tusClientDispatch(
          insertUploadInstance(
            cacheKey,
            new tus.Upload(file, {
              ...tus.defaultOptions,
              ...options,
              onSuccess,
              onError,
            })
          )
        );

        return;
      }

      setInternalTusState({
        ...internalTusState,
        upload: new tus.Upload(file, {
          ...tus.defaultOptions,
          ...options,
          onSuccess,
          onError,
        }),
      });
    },
    [tusClientDispatch, cacheKey, tus, internalTusState]
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
