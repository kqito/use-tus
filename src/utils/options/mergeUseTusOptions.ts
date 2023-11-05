import { Upload } from "tus-js-client";
import { TusHooksOptions } from "../../types";

const defaultUseTusOptionsValue = Object.freeze({
  autoAbort: true,
  autoStart: false,
  uploadOptions: undefined,
  Upload,
} as const satisfies TusHooksOptions);

export const mergeUseTusOptions = (options: TusHooksOptions) => ({
  ...defaultUseTusOptionsValue,
  ...options,
});
