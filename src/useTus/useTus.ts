import { useCallback, useMemo, useState } from "react";
import type { Upload } from "tus-js-client";
import { UseTusOptions, UseTusResult } from "./types";
import { createUpload, DispatchIsAborted } from "./utils/createUpload";
import { startOrResumeUpload } from "./utils/startOrResumeUpload";
import { useAutoAbort } from "./utils/useAutoAbort";
import { useMergeTusOptions } from "./utils/useMergeTusOptions";

type PickedUseTusResult = Pick<
  UseTusResult,
  "upload" | "isSuccess" | "error" | "isAborted"
>;

type UseTusState = PickedUseTusResult & {
  originalAbort: Upload["abort"] | undefined;
};

const initialUseTusState: Readonly<UseTusState> = Object.freeze<UseTusState>({
  upload: undefined,
  isSuccess: false,
  isAborted: false,
  error: undefined,
  originalAbort: undefined,
});

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

  const setUpload: UseTusResult["setUpload"] = useCallback(
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

      const mergedUploadOptions: Upload["options"] = {
        ...targetOptions,
        onSuccess,
        onError,
      };

      const dispatchIsAborted: DispatchIsAborted = (isAborted) => {
        updateTusState({ isAborted });
      };
      const { upload, originalAbort } = createUpload(
        file,
        mergedUploadOptions,
        dispatchIsAborted
      );

      if (autoStart) {
        startOrResumeUpload(upload);
      }

      updateTusState({ ...initialUseTusState, upload, originalAbort });
    },
    [autoStart, updateTusState, uploadOptions]
  );

  const remove = useCallback(() => {
    // `upload.abort` function will set `isAborted` state.
    // So call the original function for restore state.
    tusState?.originalAbort?.();
    setTusState(initialUseTusState);
  }, [tusState]);

  const tusResult = useMemo<UseTusResult>(
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

  useAutoAbort(tusResult.upload, tusState.originalAbort, autoAbort ?? false);

  return tusResult;
};
