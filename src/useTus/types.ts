import type { Upload, UploadOptions } from "tus-js-client";

export interface TusHooksOptions {
  autoAbort?: boolean;
  autoStart?: boolean;
  uploadOptions?: UploadOptions;
}

type SetUpload = (file: Upload["file"], options?: Upload["options"]) => void;

export type TusHooksResultFn = {
  setUpload: SetUpload;
  remove: () => void;
};

export type TusHooksInternalStateFalsely = {
  upload: undefined;
  error: undefined;
  isSuccess: false;
  isAborted: false;
  isUploading: false;
};

export type TusHooksInternalStateTruthly = {
  upload: Upload;
  error?: Error;
  isSuccess: boolean;
  isAborted: boolean;
  isUploading: boolean;
};

export type TusHooksInternalState =
  | TusHooksInternalStateFalsely
  | TusHooksInternalStateTruthly;

export type TusHooksResult = TusHooksInternalState & TusHooksResultFn;
