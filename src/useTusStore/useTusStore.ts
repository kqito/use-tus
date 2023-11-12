import { useCallback, useMemo } from "react";
import { type Upload as UploadType } from "tus-js-client";
import {
  useTusClientState,
  useTusClientDispatch,
} from "../TusClientProvider/store/contexts";
import {
  insertUploadInstance,
  removeUploadInstance,
  updateUploadContext,
} from "../TusClientProvider/store/tucClientActions";
import {
  TusHooksOptions,
  TusHooksResult,
  TusHooksUploadOptions,
} from "../types";
import {
  mergeUseTusOptions,
  createUpload,
  startOrResumeUpload,
  useAutoAbort,
  splitTusHooksUploadOptions,
} from "../utils";

export const useTusStore = (
  cacheKey: string,
  baseOption: TusHooksOptions = {}
): TusHooksResult => {
  const {
    autoAbort,
    autoStart,
    uploadOptions: defaultUploadOptions,
    Upload,
  } = mergeUseTusOptions(baseOption);
  const { defaultOptions, uploads } = useTusClientState();
  const tusClientDispatch = useTusClientDispatch();

  const setUpload: TusHooksResult["setUpload"] = useCallback(
    (file, options = {}) => {
      const targetOptions = {
        ...defaultOptions?.(file),
        ...defaultUploadOptions,
        ...options,
      };

      const onSuccess = () => {
        tusClientDispatch(
          updateUploadContext(cacheKey, { isSuccess: true, isUploading: false })
        );
        targetOptions?.onSuccess?.(upload);
      };

      const onError = (error: Error) => {
        tusClientDispatch(
          updateUploadContext(cacheKey, { error, isUploading: false })
        );
        targetOptions?.onError?.(error, upload);
      };

      const mergedUploadOptions: TusHooksUploadOptions = {
        ...targetOptions,
        onSuccess,
        onError,
      };

      const onChange = (newUpload: UploadType) => {
        // For re-rendering when `upload` object is changed.
        tusClientDispatch(updateUploadContext(cacheKey, { upload: newUpload }));
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

      const { uploadOptions, uploadFnOptions } =
        splitTusHooksUploadOptions(mergedUploadOptions);

      const { upload } = createUpload({
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
      defaultUploadOptions,
      tusClientDispatch,
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
