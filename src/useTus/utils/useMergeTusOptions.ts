import { useMemo } from "react";
import { UseTusOptions } from "../types";

const defaultUseTusOptionsValue: Readonly<UseTusOptions> = Object.freeze<UseTusOptions>(
  {
    autoAbort: true,
    autoStart: false,
  }
);

export const useMergeTusOptions = (options: UseTusOptions | undefined) =>
  useMemo(
    () => ({
      ...defaultUseTusOptionsValue,
      ...(options || {}),
    }),
    [options]
  );
