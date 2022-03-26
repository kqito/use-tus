import type { Reducer } from "react";
import type { Upload } from "tus-js-client";
import { DefaultOptions } from "../types";
import { TusClientActions } from "./tucClientActions";

export type UploadState = {
  upload: Upload | undefined;
  isSuccess: boolean;
  isAborted: boolean;
  error?: Error;
};

export type TusClientState = {
  uploads: {
    [cacheKey: string]: UploadState | undefined;
  };
  defaultOptions: DefaultOptions | undefined;
};

export const tusClientReducer: Reducer<TusClientState, TusClientActions> = (
  state,
  actions
) => {
  switch (actions.type) {
    case "INSERT_UPLOAD_INSTANCE": {
      const { cacheKey, uploadState } = actions.payload;

      return {
        ...state,
        uploads: {
          ...state.uploads,
          [cacheKey]: uploadState,
        },
      };
    }

    case "UPDATE_SUCCESS_UPLOAD": {
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

    case "UPDATE_ERROR_UPLOAD": {
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

    case "UPDATE_IS_ABORTED_UPLOAD": {
      const { cacheKey, isAborted } = actions.payload;

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
            isAborted,
          },
        },
      };
    }

    case "REMOVE_UPLOAD_INSTANCE": {
      const { cacheKey } = actions.payload;

      const newUploads = state.uploads;
      delete newUploads[cacheKey];

      return {
        ...state,
        uploads: newUploads,
      };
    }

    case "UPDATE_DEFAULT_OPTIONS": {
      const { defaultOptions } = actions.payload;

      return {
        ...state,
        defaultOptions,
      };
    }

    default:
      return state;
  }
};

export const tusClientInitialState: TusClientState = {
  uploads: {},
  defaultOptions: undefined,
};
