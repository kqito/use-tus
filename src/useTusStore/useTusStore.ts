import { useCallback, useMemo } from "react";
import { UploadOptions } from "tus-js-client";
import {
  useTusClientState,
  useTusClientDispatch,
} from "../TusClientProvider/store/contexts";
import {
  insertUploadInstance,
  removeUploadInstance,
  updateUploadContext,
} from "../TusClientProvider/store/tucClientActions";
import { TusHooksOptions, TusHooksResult } from "../types";
import {
  mergeUseTusOptions,
  createUpload,
  startOrResumeUpload,
  useAutoAbort,
} from "../utils";

export const useTusStore = (
  cacheKey: string,
  baseOption: TusHooksOptions = {}
): TusHooksResult => {
  const { autoAbort, autoStart, uploadOptions, Upload } =
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
        tusClientDispatch(
          updateUploadContext(cacheKey, { isSuccess: true, isUploading: false })
        );
        targetOptions?.onSuccess?.();
      };

      const onError = (error: Error) => {
        tusClientDispatch(
          updateUploadContext(cacheKey, { error, isUploading: false })
        );
        targetOptions?.onError?.(error);
      };

      const mergedUploadOptions: UploadOptions = {
        ...targetOptions,
        onSuccess,
        onError,
      };

      const onStart = () => {
        tusClientDispatch(
          updateUploadContext(cacheKey, {
            isAborted: false,
            isUploading: true,
          })
        );
      };

      const onAbort = () => {
        tusClientDispatch(
          updateUploadContext(cacheKey, {
            isAborted: true,
            isUploading: false,
          })
        );
      };

      const { upload } = createUpload({
        Upload,
        file,
        options: mergedUploadOptions,
        onStart,
        onAbort,
      });

      if (autoStart) {
        startOrResumeUpload(upload);
      }

      tusClientDispatch(
        insertUploadInstance(cacheKey, {
          upload,
          error: undefined,
          isSuccess: false,
          isAborted: false,
          isUploading: false,
        })
      );
    },
    [
      Upload,
      autoStart,
      cacheKey,
      defaultOptions,
      tusClientDispatch,
      uploadOptions,
    ]
  );

  const targetTusState = useMemo(() => uploads[cacheKey], [cacheKey, uploads]);

  const remove = useCallback(() => {
    targetTusState?.upload?.abort();

    tusClientDispatch(removeUploadInstance(cacheKey));
  }, [targetTusState, tusClientDispatch, cacheKey]);

  const tusResult: TusHooksResult = targetTusState
    ? {
        ...targetTusState,
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
