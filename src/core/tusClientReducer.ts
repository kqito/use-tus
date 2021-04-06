import type { Reducer } from 'react';
import type { Upload } from 'tus-js-client';
import { TusClientActions } from './tucClientActions';
import { TusHandler } from './tusHandler';

export type UploadState = {
  upload: Upload | undefined;
  isSuccess: boolean;
  error?: Error;
};

export type TusClientState = {
  uploads: {
    [uploadKey: string]: UploadState | undefined;
  };
  tusHandler: TusHandler;
};

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

    case 'UPDATE_TUS_HANDLER_OPTIONS': {
      const { canStoreURLs, defaultOptions } = actions.payload;

      return {
        ...state,
        tusHandler: new TusHandler({
          canStoreURLs,
          defaultOptions,
        }),
      };
    }

    default:
      return state;
  }
};

export const tusClientInitialState: TusClientState = {
  uploads: {},
  tusHandler: new TusHandler(),
};
