import * as tus from 'tus-js-client';

export type Tus = typeof tus;
export type TusConfigs = Partial<{
  canStoreURLs: boolean;
  defaultOptions: tus.UploadOptions;
}>;

export class TusHandler {
  private tus: Tus;

  constructor(tusConfigs?: TusConfigs) {
    const {
      canStoreURLs = tus.canStoreURLs,
      defaultOptions = tus.defaultOptions,
    } = tusConfigs || {};

    this.tus = {
      ...tus,
      canStoreURLs,
      defaultOptions,
    };
  }

  get getTus() {
    return this.tus;
  }
}
