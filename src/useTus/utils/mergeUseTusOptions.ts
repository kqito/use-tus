import { TusHooksOptions } from "../types";

const defaultUseTusOptionsValue: Readonly<TusHooksOptions> =
  Object.freeze<TusHooksOptions>({
    autoAbort: true,
    autoStart: false,
  });

export const mergeUseTusOptions = (options: TusHooksOptions) => ({
  ...defaultUseTusOptionsValue,
  ...options,
});
