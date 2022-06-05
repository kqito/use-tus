import { Upload } from "tus-js-client";

export type DispatchIsAborted = (isAborted: boolean) => void;
export const createUpload = (
  file: Upload["file"],
  options: Upload["options"],
  dispatchIsAborted: DispatchIsAborted
) => {
  const upload = new Upload(file, options);
  const originalStart = upload.start.bind(upload);
  const originalAbort = upload.abort.bind(upload);

  const start = () => {
    originalStart();
    dispatchIsAborted(false);
  };

  const abort = async () => {
    originalAbort();
    dispatchIsAborted(true);
  };

  upload.start = start;
  upload.abort = abort;

  return { upload, originalStart, originalAbort };
};
