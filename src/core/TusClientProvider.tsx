import {
  createContext,
  Dispatch,
  FC,
  Reducer,
  useContext,
  useReducer,
} from 'react';
import { Upload } from 'tus-js-client';

type TusClientState = {
  uploads: {
    [uploadKey: string]: Upload;
  };
  dispatch?: Dispatch<TusClientActions>;
};

type TusClientActions = ReturnType<
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

const tusClientReducer: Reducer<TusClientState, TusClientActions> = (
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
const tusClientInitialState: TusClientState = { uploads: {} };

const DefaultContext = createContext<TusClientState | undefined>(undefined);

export const useTusClient = () => {
  const tusClient = useContext(DefaultContext);

  if (!tusClient) {
    throw new Error('No TusClient set, use TusClientProvider to set one');
  }

  return tusClient;
};

export const TusClientProvider: FC = ({ children }) => {
  const [tusClientState, tusClientDispatch] = useReducer(
    tusClientReducer,
    tusClientInitialState
  );

  const contextValue = { ...tusClientState, dispatch: tusClientDispatch };

  return (
    <DefaultContext.Provider value={contextValue}>
      {children}
    </DefaultContext.Provider>
  );
};
