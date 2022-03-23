import * as tus from "tus-js-client";
import { Upload } from "tus-js-client";

export type DefaultOptions = (file: Upload["file"]) => tus.UploadOptions;
export type TusConfigs = Partial<{
  canStoreURLs: boolean;
  defaultOptions: DefaultOptions;
}>;

export type Tus = Readonly<
  Omit<typeof tus, "defaultOptions"> & Required<TusConfigs>
>;

export const initialDefaultOptions: DefaultOptions = () => tus.defaultOptions;
export class TusHandler {
  private tus: Tus;

  constructor(tusConfigs?: TusConfigs) {
    const {
      canStoreURLs = tus.canStoreURLs,
      defaultOptions = initialDefaultOptions,
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
