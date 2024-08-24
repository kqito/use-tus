/* eslint-disable @typescript-eslint/no-explicit-any */
import { UploadOptions, type Upload as UploadType } from "tus-js-client";
import { TusHooksUploadFnOptions, UploadFile } from "../../types";

export type CreateUploadParams = {
  Upload: typeof UploadType;
  file: UploadFile;
  uploadOptions: UploadOptions;
  uploadFnOptions: TusHooksUploadFnOptions;
  onChange: (upload: UploadType) => void;
  onStart: () => void;
  onAbort: () => void;
};

const bindOnChange = (
  upload: UploadType,
  onChange: (upload: UploadType) => void,
  key: keyof UploadType
) => {
  let property = upload[key];
  const originalUrlDescriptor = Object.getOwnPropertyDescriptor(upload, key);
  Object.defineProperty(upload, key, {
    get() {
      return originalUrlDescriptor?.get?.() ?? property;
    },
    set(value) {
      if (originalUrlDescriptor?.set) {
        originalUrlDescriptor.set.call(upload, value);
      } else {
        property = value;
      }

      onChange(this);
    },
  });
};

export const createUpload = ({
  Upload,
  file,
  uploadOptions,
  uploadFnOptions,
  onChange,
  onStart,
  onAbort,
}: CreateUploadParams) => {
  const upload = new Upload(file, uploadOptions);
  const originalStart = upload.start.bind(upload);
  const originalAbort = upload.abort.bind(upload);

  const start: UploadType["start"] = (...args) => {
    originalStart(...args);
    onStart();
  };

  const abort: UploadType["abort"] = async (...args) => {
    originalAbort(...args);
    onAbort();
  };

  upload.start = start;
  upload.abort = abort;

  bindOnChange(upload, onChange, "url");

  Object.entries(uploadFnOptions).forEach(([key, value]) => {
    if (typeof value !== "function") {
      return;
    }

    const bindedFn: any = (...args: any[]) => value(...args, upload as any);
    upload.options[key as keyof TusHooksUploadFnOptions] = bindedFn;
  });

  return { upload, originalStart, originalAbort };
};
