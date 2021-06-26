import type { Upload } from 'tus-js-client';

export type UseTusOptions = {
  cacheKey?: string;
  autoAbort?: boolean;
  autoStart?: boolean;
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
