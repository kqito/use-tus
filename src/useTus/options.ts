import { UseTusOptions, UseTusState } from './types';

export const defaultUseTusOptionsValue: Readonly<UseTusOptions> = Object.freeze<UseTusOptions>(
  {
    autoAbort: true,
    autoStart: false,
  }
);

export const initialUseTusState: Readonly<UseTusState> = Object.freeze<UseTusState>(
  {
    upload: undefined,
    isSuccess: false,
    isAborted: false,
    error: undefined,
  }
);
