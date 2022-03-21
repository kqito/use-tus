import type { Upload, UploadOptions } from 'tus-js-client';

export type UseTusOptions = {
  autoAbort?: boolean;
  autoStart?: boolean;
  uploadOptions?: UploadOptions;
};

export type UseTusResult = {
  upload?: Upload;
  setUpload: (file: Upload['file'], options?: Upload['options']) => void;
  remove: () => void;
  isSuccess: boolean;
  isAborted: boolean;
  error?: Error;
};
export type UseTusState = Pick<
  UseTusResult,
  'upload' | 'isSuccess' | 'error' | 'isAborted'
>;
