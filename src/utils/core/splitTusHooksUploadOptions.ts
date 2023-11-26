import { UploadOptions } from "tus-js-client";
import { TusHooksUploadFnOptions, TusHooksUploadOptions } from "../../types";

export function splitTusHooksUploadOptions(options: TusHooksUploadOptions) {
  const uploadOptions = Object.entries(options).reduce<UploadOptions>(
    (acc, [key, value]) => ({
      ...acc,
      [key]: typeof value !== "function" ? value : undefined,
    }),
    {}
  );

  const uploadFnOptions = Object.entries(
    options
  ).reduce<TusHooksUploadFnOptions>(
    (acc, [key, value]) => ({
      ...acc,
      [key]: typeof value === "function" ? value : undefined,
    }),
    {}
  );

  return {
    uploadOptions,
    uploadFnOptions,
  };
}
