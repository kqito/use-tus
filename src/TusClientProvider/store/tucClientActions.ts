import type { Upload } from "tus-js-client";
import { DefaultOptions } from "../types";

export type TusClientActions = ReturnType<
  | typeof insertUploadInstance
  | typeof removeUploadInstance
  | typeof updateSuccessUpload
  | typeof updateErrorUpload
  | typeof updateIsAbortedUpload
  | typeof resetClient
  | typeof updateDefaultOptions
>;

export const insertUploadInstance = (cacheKey: string, upload: Upload) =>
  ({
    type: "INSERT_UPLOAD_INSTANCE",
    payload: {
      cacheKey,
      uploadState: {
        upload,
        isSuccess: false,
        isAborted: false,
      },
    },
  } as const);

export const updateSuccessUpload = (cacheKey: string) =>
  ({
    type: "UPDATE_SUCCESS_UPLOAD",
    payload: {
      cacheKey,
    },
  } as const);

export const updateErrorUpload = (cacheKey: string, error?: Error) =>
  ({
    type: "UPDATE_ERROR_UPLOAD",
    payload: {
      cacheKey,
      error,
    },
  } as const);

export const updateIsAbortedUpload = (cacheKey: string, isAborted: boolean) =>
  ({
    type: "UPDATE_IS_ABORTED_UPLOAD",
    payload: {
      cacheKey,
      isAborted,
    },
  } as const);

export const removeUploadInstance = (cacheKey: string) =>
  ({
    type: "REMOVE_UPLOAD_INSTANCE",
    payload: {
      cacheKey,
    },
  } as const);

export const resetClient = () =>
  ({
    type: "RESET_CLIENT",
  } as const);

export const updateDefaultOptions = (
  defaultOptions: DefaultOptions | undefined
) =>
  ({
    type: "UPDATE_DEFAULT_OPTIONS",
    payload: {
      defaultOptions,
    },
  } as const);
