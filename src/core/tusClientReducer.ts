import { Reducer } from 'react';
import { Upload } from 'tus-js-client';

export type TusClientState = {
  uploads: {
    [uploadKey: string]: Upload | undefined;
  };
};

export type TusClientActions = ReturnType<
  typeof insertUploadInstance | typeof removeUploadInstance
>;

export const insertUploadInstance = (uploadKey: string, upload: Upload) =>
  ({
    type: 'INSERT_UPLOAD_INSTANCE',
    payload: {
      uploadKey,
      upload,
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
      const { uploadKey, upload } = actions.payload;

      return {
        ...state,
        uploads: {
          ...state.uploads,
          [uploadKey]: upload,
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
