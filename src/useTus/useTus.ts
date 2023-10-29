import { useCallback, useState } from "react";
import type { Upload } from "tus-js-client";
import {
  TusHooksOptions,
  TusHooksResult,
  TusHooksInternalStateTruthly,
  TusHooksInternalState,
} from "./types";
import { createUpload } from "./utils/createUpload";
import { startOrResumeUpload } from "./utils/startOrResumeUpload";
import { useAutoAbort } from "./hooks/useAutoAbort";
import { mergeUseTusOptions } from "./utils";

type UseTusInternalState = TusHooksInternalState & {
  originalAbort: Upload["abort"] | undefined;
};

const initialUseTusState: Readonly<UseTusInternalState> =
  Object.freeze<UseTusInternalState>({
    upload: undefined,
    isSuccess: false,
    isAborted: false,
    isUploading: false,
    error: undefined,
    originalAbort: undefined,
  });

export const useTus = (baseOption: TusHooksOptions = {}): TusHooksResult => {
  const { autoAbort, autoStart, uploadOptions } =
    mergeUseTusOptions(baseOption);

  const [tusInternalState, setTusInternalState] =
    useState<UseTusInternalState>(initialUseTusState);

  const updateInternalTruthlyState = (
    upload: Partial<TusHooksInternalStateTruthly>
  ) => {
    setTusInternalState((prev) => {
      if (prev.upload === undefined) {
        return prev; // TODO: Add appriopriate error handling
      }
      return { ...prev, ...upload };
    });
  };

  const setUpload: TusHooksResult["setUpload"] = useCallback(
    (file, options = {}) => {
      const targetOptions = {
        ...uploadOptions,
        ...options,
      };

      const onSuccess = () => {
        updateInternalTruthlyState({ isSuccess: true });

        targetOptions?.onSuccess?.();
      };

      const onError = (error: Error) => {
        updateInternalTruthlyState({ error });
        targetOptions?.onError?.(error);
      };

      const mergedUploadOptions: Upload["options"] = {
        ...targetOptions,
        onSuccess,
        onError,
      };

      const onStart = () => {
        updateInternalTruthlyState({ isUploading: true, isAborted: false });
      };

      const onAbort = () => {
        updateInternalTruthlyState({ isUploading: false, isAborted: true });
      };

      const { upload, originalAbort } = createUpload({
        file,
        options: mergedUploadOptions,
        onStart,
        onAbort,
      });

      if (autoStart) {
        startOrResumeUpload(upload);
      }

      setTusInternalState({
        upload,
        error: undefined,
        isSuccess: false,
        isAborted: false,
        isUploading: false,
        originalAbort,
      });
    },
    [autoStart, uploadOptions]
  );

  const remove = useCallback(() => {
    // `upload.abort` function will set `isAborted` state.
    // So call the original function for restore state.
    tusInternalState?.originalAbort?.();
    setTusInternalState(initialUseTusState);
  }, [tusInternalState]);

  const tusResult: TusHooksResult = {
    ...tusInternalState,
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
