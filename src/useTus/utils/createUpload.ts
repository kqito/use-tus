import { Upload } from "tus-js-client";

export type CreateUploadParams = {
  file: Upload["file"];
  options: Upload["options"];
  onStart: () => void;
  onAbort: () => void;
};

export const createUpload = ({
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
