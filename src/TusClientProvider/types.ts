import { Upload, UploadOptions } from "tus-js-client";

export type DefaultOptions = (file: Upload["file"]) => UploadOptions;
