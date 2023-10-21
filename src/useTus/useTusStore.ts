import { useCallback, useMemo } from "react";
import type { Upload } from "tus-js-client";
import {
  useTusClientState,
  useTusClientDispatch,
} from "../TusClientProvider/store/contexts";
import {
  updateSuccessUpload,
  updateErrorUpload,
  updateIsAbortedUpload,
  insertUploadInstance,
  removeUploadInstance,
} from "../TusClientProvider/store/tucClientActions";
import { UseTusOptions, UseTusResult } from "./types";
import { DispatchIsAborted, createUpload } from "./utils/createUpload";
import { startOrResumeUpload } from "./utils/startOrResumeUpload";
import { useAutoAbort } from "./utils/useAutoAbort";
import { useMergeTusOptions } from "./utils/useMergeTusOptions";

export const useTusStore = (
  cacheKey: string,
  baseOption?: UseTusOptions
): UseTusResult => {
  const { autoAbort, autoStart, uploadOptions } =
    useMergeTusOptions(baseOption);
  const { defaultOptions, uploads } = useTusClientState();
  const tusClientDispatch = useTusClientDispatch();

  const setUpload: UseTusResult["setUpload"] = useCallback(
    (file, options = {}) => {
      const targetOptions = {
        ...defaultOptions?.(file),
        ...uploadOptions,
        ...options,
      };

      const onSuccess = () => {
        tusClientDispatch(updateSuccessUpload(cacheKey));
        targetOptions?.onSuccess?.();
      };

      const onError = (error: Error) => {
        tusClientDispatch(updateErrorUpload(cacheKey, error));
        targetOptions?.onError?.(error);
      };

      const mergedUploadOptions: Upload["options"] = {
        ...targetOptions,
        onSuccess,
        onError,
      };

      const dispatchIsAborted: DispatchIsAborted = (isAborted) => {
        tusClientDispatch(updateIsAbortedUpload(cacheKey, isAborted));
      };
      const { upload } = createUpload(
        file,
        mergedUploadOptions,
        dispatchIsAborted
      );

      if (autoStart) {
        startOrResumeUpload(upload);
      }

      tusClientDispatch(insertUploadInstance(cacheKey, upload));
    },
    [autoStart, cacheKey, defaultOptions, tusClientDispatch, uploadOptions]
  );

  const targetTusState = useMemo(() => uploads[cacheKey], [cacheKey, uploads]);

  const remove = useCallback(() => {
    targetTusState?.upload?.abort();

    tusClientDispatch(removeUploadInstance(cacheKey));
  }, [targetTusState, tusClientDispatch, cacheKey]);

  const tusResult = useMemo<UseTusResult>(
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

  useAutoAbort(tusResult.upload, tusResult.upload?.abort, autoAbort ?? false);

  return tusResult;
};
