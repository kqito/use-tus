import type { Upload } from 'tus-js-client';
import { TusConfigs } from './tusHandler';

export type TusClientActions = ReturnType<
  | typeof insertUploadInstance
  | typeof removeUploadInstance
  | typeof successUpload
  | typeof errorUpload
  | typeof updateTusHandlerOptions
>;

export const insertUploadInstance = (cacheKey: string, upload: Upload) =>
  ({
    type: 'INSERT_UPLOAD_INSTANCE',
    payload: {
      cacheKey,
      uploadState: {
        upload,
        isSuccess: false,
      },
    },
  } as const);

export const successUpload = (cacheKey: string) =>
  ({
    type: 'SUCCESS_UPLOAD',
    payload: {
      cacheKey,
    },
  } as const);

export const errorUpload = (cacheKey: string, error?: Error) =>
  ({
    type: 'ERROR_UPLOAD',
    payload: {
      cacheKey,
      error,
    },
  } as const);

export const removeUploadInstance = (cacheKey: string) =>
  ({
    type: 'REMOVE_UPLOAD_INSTANCE',
    payload: {
      cacheKey,
    },
  } as const);

export const updateTusHandlerOptions = (payload: TusConfigs) =>
  ({
    type: 'UPDATE_TUS_HANDLER_OPTIONS',
    payload,
  } as const);
