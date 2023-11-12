import { Upload } from "tus-js-client";
import { TusHooksUploadOptions } from "../types";

export type DefaultOptions = (file: Upload["file"]) => TusHooksUploadOptions;
