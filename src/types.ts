import type { Upload, UploadOptions } from "tus-js-client";

export interface TusHooksOptions {
  autoAbort?: boolean;
  autoStart?: boolean;
  uploadOptions?: UploadOptions;
  Upload?: typeof Upload;
}

export type UploadFile = Upload["file"];
export type SetUpload = (
  file: Upload["file"],
  options?: Upload["options"]
) => void;

export type TusHooksResultFn = {
  setUpload: SetUpload;
  remove: () => void;
};

export type TusFalselyContext = {
  upload: undefined;
  error: undefined;
  isSuccess: false;
  isAborted: false;
  isUploading: false;
};

export type TusTruthlyContext = {
  upload: Upload;
  error?: Error;
  isSuccess: boolean;
  isAborted: boolean;
  isUploading: boolean;
};

export type TusContext = TusFalselyContext | TusTruthlyContext;
export type TusHooksResult = TusContext & TusHooksResultFn;
