import { Upload } from "tus-js-client";

export type BaseUseTusResult = {
  upload?: Upload;
  setUpload: (file: Upload["file"], options?: Upload["options"]) => void;
  isSuccess: boolean;
  error?: Error;
};

/* eslint-disable-next-line @typescript-eslint/ban-types */
export type BaseUseTusOptions = {};
