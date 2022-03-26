import type { Upload, UploadOptions } from "tus-js-client";

export interface UseTusOptions {
  autoAbort?: boolean;
  autoStart?: boolean;
  uploadOptions?: UploadOptions;
}

export interface UseTusResult {
  upload?: Upload;
  setUpload: (file: Upload["file"], options?: Upload["options"]) => void;
  isSuccess: boolean;
  isAborted: boolean;
  error?: Error;
  remove: () => void;
}
