import { useCallback, useState } from "react";
import { type Upload as UploadType } from "tus-js-client";
import {
  TusHooksOptions,
  TusHooksResult,
  TusTruthlyContext,
  TusContext,
  TusHooksUploadOptions,
} from "../types";
import {
  mergeUseTusOptions,
  createUpload,
  startOrResumeUpload,
  useAutoAbort,
} from "../utils";
import { splitTusHooksUploadOptions } from "../utils/core/splitTusHooksUploadOptions";

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
  const {
    autoAbort,
    autoStart,
    uploadOptions: baseUploadOptions,
    Upload,
  } = mergeUseTusOptions(baseOption);

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
        ...baseUploadOptions,
        ...options,
      };

      function onSuccess() {
        updateTusTruthlyContext({ isSuccess: true, isUploading: false });

        targetOptions?.onSuccess?.(upload);
      }

      const onError = (error: Error) => {
        updateTusTruthlyContext({
          error,
          isUploading: false,
        });
        targetOptions?.onError?.(error, upload);
      };

      const mergedUploadOptions: TusHooksUploadOptions = {
        ...targetOptions,
        onSuccess,
        onError,
      };

      const onChange = (newUpload: UploadType) => {
        // For re-rendering when `upload` object is changed.
        setTusContext((prev) => ({ ...prev, upload: newUpload }));
      };

      const onStart = () => {
        updateTusTruthlyContext({ isUploading: true, isAborted: false });
      };

      const onAbort = () => {
        updateTusTruthlyContext({ isUploading: false, isAborted: true });
      };

      const { uploadOptions, uploadFnOptions } =
        splitTusHooksUploadOptions(mergedUploadOptions);

      const { upload, originalAbort } = createUpload({
        Upload,
        file,
        uploadOptions,
        uploadFnOptions,
        onChange,
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
    [Upload, autoStart, baseUploadOptions]
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
