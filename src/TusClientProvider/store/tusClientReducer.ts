import type { Reducer } from "react";
import { DefaultOptions } from "../types";
import { TusClientActions } from "./tucClientActions";
import { TusTruthlyContext } from "../../types";

export type TusClientState = {
  uploads: {
    [cacheKey: string]: TusTruthlyContext | undefined;
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

    case "UPDATE_UPLOAD_CONTEXT": {
      const { cacheKey, context } = actions.payload;

      const target = state.uploads[cacheKey];

      if (!target) {
        return state;
      }

      return {
        ...state,
        uploads: { ...state.uploads, [cacheKey]: { ...target, ...context } },
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

    case "RESET_CLIENT": {
      return {
        ...state,
        uploads: {},
      };
    }

    default: {
      actions satisfies never;
      return state;
    }
  }
};

export const tusClientInitialState: TusClientState = {
  uploads: {},
  defaultOptions: undefined,
};
