import { useCallback, useState } from "react";
import { UploadOptions } from "tus-js-client";
import {
  TusHooksOptions,
  TusHooksResult,
  TusTruthlyContext,
  TusContext,
} from "../types";
import {
  mergeUseTusOptions,
  createUpload,
  startOrResumeUpload,
  useAutoAbort,
} from "../utils";

type UseTusInternalState = {
  originalAbort: (() => Promise<void>) | undefined;
};

const initialTusContext = Object.freeze({
  upload: undefined,
  isSuccess: false,
  isAborted: false,
  isUploading: false,
  error: undefined,
} as const satisfies TusContext);

export const useTus = (baseOption: TusHooksOptions = {}): TusHooksResult => {
  const { autoAbort, autoStart, uploadOptions, Upload } =
    mergeUseTusOptions(baseOption);

  const [tusContext, setTusContext] = useState<TusContext>(initialTusContext);
  const [tusInternalState, setTusInternalState] = useState<UseTusInternalState>(
    {
      originalAbort: undefined,
    }
  );

  const updateTusTruthlyContext = (
    context: Omit<Partial<TusTruthlyContext>, "upload">
  ) => {
    setTusContext((prev) => {
      if (prev.upload === undefined) {
        return prev; // TODO: Add appriopriate error handling
      }
      return { ...prev, ...context };
    });
  };

  const setUpload: TusHooksResult["setUpload"] = useCallback(
    (file, options = {}) => {
      const targetOptions = {
        ...uploadOptions,
        ...options,
      };

      const onSuccess = () => {
        updateTusTruthlyContext({ isSuccess: true, isUploading: false });

        targetOptions?.onSuccess?.();
      };

      const onError = (error: Error) => {
        updateTusTruthlyContext({
          error,
          isUploading: false,
        });
        targetOptions?.onError?.(error);
      };

      const mergedUploadOptions: UploadOptions = {
        ...targetOptions,
        onSuccess,
        onError,
      };

      const onStart = () => {
        updateTusTruthlyContext({ isUploading: true, isAborted: false });
      };

      const onAbort = () => {
        updateTusTruthlyContext({ isUploading: false, isAborted: true });
      };

      const { upload, originalAbort } = createUpload({
        Upload,
        file,
        options: mergedUploadOptions,
        onStart,
        onAbort,
      });

      if (autoStart) {
        startOrResumeUpload(upload);
      }

      setTusContext({
        upload,
        error: undefined,
        isSuccess: false,
        isAborted: false,
        isUploading: false,
      });
      setTusInternalState({ originalAbort });
    },
    [Upload, autoStart, uploadOptions]
  );

  const remove = useCallback(() => {
    // `upload.abort` function will set `isAborted` state.
    // So call the original function for restore state.
    tusInternalState?.originalAbort?.();
    setTusContext(initialTusContext);
    setTusInternalState({ originalAbort: undefined });
  }, [tusInternalState]);

  const tusResult: TusHooksResult = {
    ...tusContext,
    setUpload,
    remove,
  };

  useAutoAbort({
    upload: tusResult.upload,
    abort: tusInternalState.originalAbort,
    autoAbort: autoAbort ?? false,
  });

  return tusResult;
};
