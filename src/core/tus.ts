import { useMemo } from 'react';
import * as originTus from 'tus-js-client';

let tusHandler: TusHandler | undefined;

export const useCoreTus = () =>
  useMemo(() => {
    if (!tusHandler) {
      tusHandler = new TusHandler();
    }

    return tusHandler.getTus;
  }, []);

export const useTusHandler = () =>
  useMemo(() => {
    if (!tusHandler) {
      tusHandler = new TusHandler();
    }

    return tusHandler;
  }, []);

class TusHandler {
  private tus: typeof originTus;

  constructor() {
    this.tus = { ...originTus };
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

  set setDefaultOptions(defaultOptions: originTus.UploadOptions) {
    this.tus = {
      ...this.tus,
      defaultOptions,
    };
  }

  reset() {
    this.tus = { ...originTus };
  }
}
