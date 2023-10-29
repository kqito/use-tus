import { DefaultOptions } from "../types";
import { TusTruthlyContext } from "../../types";

export type TusClientActions = ReturnType<
  | typeof insertUploadInstance
  | typeof removeUploadInstance
  | typeof updateUploadContext
  | typeof resetClient
  | typeof updateDefaultOptions
>;

export const insertUploadInstance = (
  cacheKey: string,
  state: TusTruthlyContext
) =>
  ({
    type: "INSERT_UPLOAD_INSTANCE",
    payload: {
      cacheKey,
      uploadState: state,
    },
  } as const);

export const updateUploadContext = (
  cacheKey: string,
  context: Partial<Omit<TusTruthlyContext, "upload">>
) =>
  ({
    type: "UPDATE_UPLOAD_CONTEXT",
    payload: {
      cacheKey,
      context,
    },
  } as const);

export const removeUploadInstance = (cacheKey: string) =>
  ({
    type: "REMOVE_UPLOAD_INSTANCE",
    payload: {
      cacheKey,
    },
  } as const);

export const resetClient = () =>
  ({
    type: "RESET_CLIENT",
  } as const);

export const updateDefaultOptions = (
  defaultOptions: DefaultOptions | undefined
) =>
  ({
    type: "UPDATE_DEFAULT_OPTIONS",
    payload: {
      defaultOptions,
    },
  } as const);
