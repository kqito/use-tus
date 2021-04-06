import { useMemo } from 'react';
import * as tus from 'tus-js-client';

let tusHandler: TusHandler | undefined;

export const useTusHandler = () =>
  useMemo(() => {
    if (tusHandler === undefined) {
      tusHandler = new TusHandler(tus);
    }

    return tusHandler;
  }, []);

export class TusHandler {
  private tus: typeof tus;

  constructor(tusObject?: typeof tus) {
    this.tus = { ...(tusObject || tus) };
  }

  get getTus() {
    return this.tus;
  }

  set setCanStoreURLs(canStoreURLs: boolean) {
    this.tus = {
      ...this.tus,
      canStoreURLs,
    };
  }

  set setDefaultOptions(defaultOptions: tus.UploadOptions) {
    this.tus = {
      ...this.tus,
      defaultOptions,
    };
  }

  reset(tusObject?: typeof tus) {
    this.tus = { ...(tusObject || tus) };
  }
}
