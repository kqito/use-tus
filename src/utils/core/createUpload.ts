import { type UploadOptions, type Upload as UploadType } from "tus-js-client";
import { UploadFile } from "../../types";

export type CreateUploadParams = {
  Upload: typeof UploadType;
  file: UploadFile;
  options: UploadOptions;
  onStart: () => void;
  onAbort: () => void;
};

export const createUpload = ({
  Upload,
  file,
  options,
  onStart,
  onAbort,
}: CreateUploadParams) => {
  const upload = new Upload(file, options);
  const originalStart = upload.start.bind(upload);
  const originalAbort = upload.abort.bind(upload);

  const start = () => {
    originalStart();
    onStart();
  };

  const abort = async () => {
    originalAbort();
    onAbort();
  };

  upload.start = start;
  upload.abort = abort;

  return { upload, originalStart, originalAbort };
};
