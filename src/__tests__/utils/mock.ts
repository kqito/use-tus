import { type Mock, vi } from "vitest";
import type { Upload, UploadOptions } from "tus-js-client";
import * as startOrResumeUploadObject from "../../utils/core/startOrResumeUpload";
import { UploadFile } from "../../types";
import { createMock } from "./createMock";

export const createUploadMock = (start: Mock, abort: Mock) => {
  class UploadMock {
    file: UploadFile;

    options: UploadOptions;

    url: string | null;

    constructor(file: UploadFile, options: UploadOptions) {
      this.file = file;
      this.options = options;
      this.url = null;
    }

    start = start;

    abort = abort;
  }

  return createMock<typeof Upload>(UploadMock);
};

export const createConsoleErrorMock = () => {
  const consoleMock = vi.spyOn(console, "error");
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

export const startOrResumeUploadMock = vi
  .spyOn(startOrResumeUploadObject, "startOrResumeUpload")
  .mockImplementationOnce(() => vi.fn());
