/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Upload, UploadOptions } from "tus-js-client";

export interface TusHooksOptions {
  autoAbort?: boolean;
  autoStart?: boolean;
  uploadOptions?: TusHooksUploadOptions;
  Upload?: typeof Upload;
}

export type Merge<
  T extends Record<PropertyKey, any>,
  R extends Record<PropertyKey, any>
> = { [P in keyof Omit<T, keyof R>]: T[P] } & R;

type AddUploadParamater<F> = F extends (...args: infer A) => infer R
  ? (...args: [...A, ...[upload: Upload]]) => R
  : never;

type Callbacks<T> = {
  [P in keyof T as P extends `on${string}`
    ? // eslint-disable-next-line @typescript-eslint/ban-types
      NonNullable<T[P]> extends Function
      ? P
      : never
    : never]: T[P];
};

export type TusHooksUploadFnOptions = {
  [K in keyof Callbacks<UploadOptions>]: AddUploadParamater<
    Callbacks<UploadOptions>[K]
  >;
};

export type TusHooksUploadOptions = Merge<
  UploadOptions,
  TusHooksUploadFnOptions
>;

export type UploadFile = Upload["file"];
export type SetUpload = (
  file: Upload["file"],
  options?: TusHooksUploadOptions
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
