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
    [cacheKey: string]: UploadState | undefined;
  };
  tusHandler: TusHandler;
};

export const tusClientReducer: Reducer<TusClientState, TusClientActions> = (
  state,
  actions
) => {
  switch (actions.type) {
    case 'INSERT_UPLOAD_INSTANCE': {
      const { cacheKey, uploadState } = actions.payload;

      return {
        ...state,
        uploads: {
          ...state.uploads,
          [cacheKey]: uploadState,
        },
      };
    }

    case 'SUCCESS_UPLOAD': {
      const { cacheKey } = actions.payload;

      const target = state.uploads[cacheKey];

      if (!target) {
        return state;
      }

      return {
        ...state,
        uploads: {
          ...state.uploads,
          [cacheKey]: {
            ...(target || {}),
            isSuccess: true,
          },
        },
      };
    }

    case 'ERROR_UPLOAD': {
      const { cacheKey, error } = actions.payload;

      const target = state.uploads[cacheKey];

      if (!target) {
        return state;
      }

      return {
        ...state,
        uploads: {
          ...state.uploads,
          [cacheKey]: {
            ...target,
            error,
          },
        },
      };
    }

    case 'REMOVE_UPLOAD_INSTANCE': {
      const { cacheKey } = actions.payload;

      const newUploads = state.uploads;
      delete newUploads[cacheKey];

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
