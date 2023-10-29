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
  updateIsUploadingUpload,
} from "../TusClientProvider/store/tucClientActions";
import { TusHooksOptions, TusHooksResult } from "./types";
import { createUpload } from "./utils/createUpload";
import { startOrResumeUpload } from "./utils/startOrResumeUpload";
import { useAutoAbort } from "./hooks/useAutoAbort";
import { mergeUseTusOptions } from "./utils";

export const useTusStore = (
  cacheKey: string,
  baseOption: TusHooksOptions = {}
): TusHooksResult => {
  const { autoAbort, autoStart, uploadOptions } =
    mergeUseTusOptions(baseOption);
  const { defaultOptions, uploads } = useTusClientState();
  const tusClientDispatch = useTusClientDispatch();

  const setUpload: TusHooksResult["setUpload"] = useCallback(
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

      const onStart = () => {
        tusClientDispatch(updateIsAbortedUpload(cacheKey, false));
        tusClientDispatch(updateIsUploadingUpload(cacheKey, true));
      };

      const onAbort = () => {
        tusClientDispatch(updateIsAbortedUpload(cacheKey, true));
        tusClientDispatch(updateIsUploadingUpload(cacheKey, false));
      };

      const { upload } = createUpload({
        file,
        options: mergedUploadOptions,
        onStart,
        onAbort,
      });

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

  const tusResult: TusHooksResult = targetTusState
    ? {
        ...(targetTusState as any),
        setUpload,
        remove,
      }
    : {
        upload: undefined,
        error: undefined,
        isSuccess: false,
        isAborted: false,
        isUploading: false,
        setUpload,
        remove,
      };

  useAutoAbort({
    upload: tusResult.upload,
    abort: tusResult.upload?.abort,
    autoAbort: autoAbort ?? false,
  });

  return tusResult;
};
