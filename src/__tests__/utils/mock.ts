import type { Upload, UploadOptions } from "tus-js-client";
import * as startOrResumeUploadObject from "../../utils/core/startOrResumeUpload";
import { UploadFile } from "../../types";

export const createMock = <T>(value: unknown) => value as T;
export const createUploadMock = (start: jest.Mock, abort: jest.Mock) => {
  class UploadMock {
    file: UploadFile;

    options: UploadOptions;

    constructor(file: UploadFile, options: UploadOptions) {
      this.file = file;
      this.options = options;
    }

    start = start;

    abort = abort;
  }

  return createMock<typeof Upload>(UploadMock);
};

export const createConsoleErrorMock = () => {
  const consoleMock = jest.spyOn(console, "error");
  consoleMock.mockImplementation(() => undefined);

  return consoleMock;
};

export const insertEnvValue = (value: NodeJS.Process["env"]) => {
  window.process = {
    ...window.process,
    env: {
      ...window.process.env,
      ...value,
    },
  };
};

export const startOrResumeUploadMock = jest
  .spyOn(startOrResumeUploadObject, "startOrResumeUpload")
  .mockImplementationOnce(() => jest.fn());
