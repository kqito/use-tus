import { Reducer } from 'react';
import { Upload } from 'tus-js-client';

export type UploadState = {
  upload: Upload | undefined;
  isSuccess: boolean;
  error?: Error;
};

export type TusClientState = {
  uploads: {
    [uploadKey: string]: UploadState | undefined;
  };
};

export type TusClientActions = ReturnType<
  | typeof insertUploadInstance
  | typeof removeUploadInstance
  | typeof successUpload
  | typeof errorUpload
>;

export const insertUploadInstance = (uploadKey: string, upload: Upload) =>
  ({
    type: 'INSERT_UPLOAD_INSTANCE',
    payload: {
      uploadKey,
      uploadState: {
        upload,
        isSuccess: false,
      },
    },
  } as const);

export const successUpload = (uploadKey: string) =>
  ({
    type: 'SUCCESS_UPLOAD',
    payload: {
      uploadKey,
    },
  } as const);

export const errorUpload = (uploadKey: string, error?: Error) =>
  ({
    type: 'ERROR_UPLOAD',
    payload: {
      uploadKey,
      error,
    },
  } as const);

export const removeUploadInstance = (uploadKey: string) =>
  ({
    type: 'REMOVE_UPLOAD_INSTANCE',
    payload: {
      uploadKey,
    },
  } as const);

export const tusClientReducer: Reducer<TusClientState, TusClientActions> = (
  state,
  actions
) => {
  switch (actions.type) {
    case 'INSERT_UPLOAD_INSTANCE': {
      const { uploadKey, uploadState } = actions.payload;

      return {
        ...state,
        uploads: {
          ...state.uploads,
          [uploadKey]: uploadState,
        },
      };
    }

    case 'SUCCESS_UPLOAD': {
      const { uploadKey } = actions.payload;

      const target = state.uploads[uploadKey];

      if (!target) {
        return state;
      }

      return {
        ...state,
        uploads: {
          ...state.uploads,
          [uploadKey]: {
            ...(target || {}),
            isSuccess: true,
          },
        },
      };
    }

    case 'ERROR_UPLOAD': {
      const { uploadKey, error } = actions.payload;

      const target = state.uploads[uploadKey];

      if (!target) {
        return state;
      }

      return {
        ...state,
        uploads: {
          ...state.uploads,
          [uploadKey]: {
            ...target,
            error,
          },
        },
      };
    }

    case 'REMOVE_UPLOAD_INSTANCE': {
      const { uploadKey } = actions.payload;

      const newUploads = state.uploads;
      delete newUploads[uploadKey];

      return {
        ...state,
        uploads: newUploads,
      };
    }

    default:
      return state;
  }
};

export const tusClientInitialState: TusClientState = { uploads: {} };
