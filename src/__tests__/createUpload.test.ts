/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DetailedError,
  HttpRequest,
  HttpResponse,
  Upload,
} from "tus-js-client";
import { getBlob } from "./utils/getBlob";
import { createUpload } from "../utils";
import { TusHooksUploadFnOptions } from "../types";
import { createMock } from "./utils/createMock";

const blog = getBlob("test");

describe("createUpload", () => {
  const detailedError = createMock<DetailedError>(new Error());
  const onChange = jest.fn();
  const onStart = jest.fn();
  const onAbort = jest.fn();
  const uploadFnOptions: TusHooksUploadFnOptions = {
    onAfterResponse: jest.fn(),
    onBeforeRequest: jest.fn(),
    onChunkComplete: jest.fn(),
    onError: jest.fn(),
    onProgress: jest.fn(),
    onShouldRetry: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should invoke onChange when some properies changed", async () => {
    const { upload } = createUpload({
      Upload,
      file: blog,
      uploadOptions: {},
      uploadFnOptions,
      onChange,
      onStart,
      onAbort,
    });

    expect(onChange).not.toBeCalled();
    expect(upload.url).toBe(null);

    upload.url = "test";
    expect(onChange).toBeCalledWith(upload);
    expect(upload.url).toBe("test");

    upload.url = null;
    expect(onChange).toBeCalledWith(upload);
    expect(upload.url).toBe(null);
  });

  test("Should invoke function with upload instance", async () => {
    const uploadOptions = {};
    const { upload } = createUpload({
      Upload,
      file: blog,
      uploadOptions,
      uploadFnOptions,
      onChange,
      onStart,
      onAbort,
    });

    expect(uploadFnOptions.onSuccess).not.toBeCalled();
    expect(uploadFnOptions.onError).not.toBeCalled();
    expect(uploadFnOptions.onProgress).not.toBeCalled();
    expect(uploadFnOptions.onShouldRetry).not.toBeCalled();
    expect(uploadFnOptions.onAfterResponse).not.toBeCalled();
    expect(uploadFnOptions.onBeforeRequest).not.toBeCalled();
    expect(uploadFnOptions.onChunkComplete).not.toBeCalled();

    upload.options?.onSuccess?.();
    expect(uploadFnOptions.onSuccess).toBeCalledWith(upload);

    upload.options?.onError?.(detailedError);
    expect(uploadFnOptions.onError).toBeCalledWith(detailedError, upload);

    upload.options?.onProgress?.(1, 2);
    expect(uploadFnOptions.onProgress).toBeCalledWith(1, 2, upload);

    upload.options?.onShouldRetry?.(detailedError, 1, uploadOptions);
    expect(uploadFnOptions.onShouldRetry).toBeCalledWith(
      detailedError,
      1,
      uploadOptions,
      upload
    );

    const req = createMock<HttpRequest>();
    const res = createMock<HttpResponse>();
    upload.options?.onAfterResponse?.(req, res);
    expect(uploadFnOptions.onAfterResponse).toBeCalledWith(req, res, upload);

    upload.options?.onBeforeRequest?.(req);
    expect(uploadFnOptions.onBeforeRequest).toBeCalledWith(req, upload);

    upload.options?.onChunkComplete?.(1, 2, 3);
    expect(uploadFnOptions.onChunkComplete).toBeCalledWith(1, 2, 3, upload);
  });
});
