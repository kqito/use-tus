import { renderHook, act, waitFor } from "@testing-library/react";
import { UploadOptions } from "tus-js-client";
import { TusHooksOptions, useTus } from "../index";
import { getBlob } from "./utils/getBlob";
import {
  createConsoleErrorMock,
  createUploadMock,
  startOrResumeUploadMock,
} from "./utils/mock";
import { getDefaultOptions } from "./utils/getDefaultOptions";
import { UploadFile } from "../types";

/* eslint-disable no-console */

const originProcess = process;

const start = jest.fn();
const abort = jest.fn();
const Upload = createUploadMock(start, abort);

const renderUseTus = (initialProps: TusHooksOptions = {}) =>
  renderHook((props) => useTus(props), {
    initialProps: {
      ...initialProps,
      Upload,
    },
  });

describe("useTus", () => {
  beforeEach(() => {
    window.process = originProcess;
    jest.resetAllMocks();
  });

  describe("uploading", () => {
    it("Should generate tus instance", async () => {
      const { result } = renderUseTus();

      const file: UploadFile = getBlob("hello");
      const options: UploadOptions = getDefaultOptions();

      expect(result.current).toEqual({
        upload: undefined,
        error: undefined,
        isSuccess: false,
        isAborted: false,
        isUploading: false,
        setUpload: expect.any(Function),
        remove: expect.any(Function),
      });

      act(() => {
        result.current.setUpload(file, options);
      });
      await waitFor(() => result.current.upload);

      expect(result.current).toEqual({
        upload: expect.any(Upload),
        error: undefined,
        isSuccess: false,
        isAborted: false,
        isUploading: false,
        setUpload: expect.any(Function),
        remove: expect.any(Function),
      });

      act(() => {
        result.current.remove();
      });
      await waitFor(() => result.current.upload);

      expect(result.current).toEqual({
        upload: undefined,
        isSuccess: false,
        error: undefined,
        isAborted: false,
        isUploading: false,
        setUpload: expect.any(Function),
        remove: expect.any(Function),
      });
    });

    it("Should setUpload without option args", async () => {
      const { result } = renderUseTus({
        uploadOptions: {
          endpoint: "hoge",
          chunkSize: 100,
        },
      });

      act(() => {
        result.current.setUpload(getBlob("hello"), {
          endpoint: "hogehoge",
          uploadSize: 1000,
        });
      });

      await waitFor(() => result.current.upload);

      expect(result.current.upload?.options.endpoint).toBe("hogehoge");
      expect(result.current.upload?.options.chunkSize).toBe(100);
      expect(result.current.upload?.options.uploadSize).toBe(1000);
    });

    it("Should change isSuccess state on success", async () => {
      const { result } = renderUseTus({ autoStart: false });

      expect(result.current).toEqual({
        upload: undefined,
        isSuccess: false,
        error: undefined,
        isAborted: false,
        isUploading: false,
        setUpload: expect.any(Function),
        remove: expect.any(Function),
      });

      const consoleErrorMock = createConsoleErrorMock();
      act(() => {
        result.current.setUpload(getBlob("hello"), {
          ...getDefaultOptions(),
          onSuccess: () => {
            console.error();
          },
        });
      });

      await waitFor(() => result.current.upload);

      expect(result.current).toEqual({
        upload: expect.any(Upload),
        isSuccess: false,
        error: undefined,
        isAborted: false,
        isUploading: false,
        setUpload: expect.any(Function),
        remove: expect.any(Function),
      });

      act(() => {
        result.current.upload?.start();
      });
      await waitFor(() => result.current.isUploading);
      expect(result.current).toEqual({
        upload: expect.any(Upload),
        isSuccess: false,
        error: undefined,
        isAborted: false,
        isUploading: true,
        setUpload: expect.any(Function),
        remove: expect.any(Function),
      });

      const onSuccess = result.current.upload?.options?.onSuccess;
      if (!onSuccess) {
        throw new Error("onSuccess is falsly.");
      }

      act(() => {
        onSuccess();
      });

      expect(result.current).toEqual({
        upload: expect.any(Upload),
        isSuccess: true,
        error: undefined,
        isAborted: false,
        isUploading: false,
        setUpload: expect.any(Function),
        remove: expect.any(Function),
      });
      expect(consoleErrorMock).toHaveBeenCalledWith();
    });
  });

  it("Should change error state on error", async () => {
    const { result } = renderUseTus();

    expect(result.current).toEqual({
      upload: undefined,
      isSuccess: false,
      error: undefined,
      isAborted: false,
      isUploading: false,
      setUpload: expect.any(Function),
      remove: expect.any(Function),
    });

    const consoleErrorMock = createConsoleErrorMock();

    act(() => {
      result.current.setUpload(getBlob("hello"), {
        ...getDefaultOptions(),
        onError: () => {
          console.error();
        },
      });
    });

    await waitFor(() => result.current.upload);

    expect(result.current).toEqual({
      upload: expect.any(Upload),
      isSuccess: false,
      error: undefined,
      isAborted: false,
      isUploading: false,
      setUpload: expect.any(Function),
      remove: expect.any(Function),
    });

    const onError = result.current.upload?.options?.onError;
    const error = new Error();

    if (!onError) {
      throw new Error("onError is falsly.");
    }

    act(() => {
      onError(error);
    });

    expect(result.current).toEqual({
      upload: expect.any(Upload),
      isSuccess: false,
      error,
      isAborted: false,
      isUploading: false,
      setUpload: expect.any(Function),
      remove: expect.any(Function),
    });
    expect(consoleErrorMock).toHaveBeenCalledWith();
  });

  describe("Options", () => {
    describe("autoAbort", () => {
      it("Should abort on unmount", async () => {
        const { result, unmount } = renderUseTus({
          autoAbort: true,
        });

        const file: UploadFile = getBlob("hello");
        const options: UploadOptions = getDefaultOptions();

        expect(result.current.upload?.abort).toBeUndefined();

        act(() => {
          result.current.setUpload(file, options);
        });

        expect(abort).not.toHaveBeenCalled();

        act(() => {
          unmount();
        });

        expect(abort).toHaveBeenCalled();
      });

      it("Should not abort on unmount", async () => {
        const { result, unmount } = renderUseTus({ autoAbort: false });

        const file: UploadFile = getBlob("hello");
        const options: UploadOptions = getDefaultOptions();

        expect(result.current.upload?.abort).toBeUndefined();

        act(() => {
          result.current.setUpload(file, options);
        });

        expect(abort).not.toHaveBeenCalled();

        unmount();

        expect(abort).not.toHaveBeenCalled();
      });
    });

    describe("autoStart", () => {
      it("Should not call startOrResumeUpload function when autoStart is false", async () => {
        const { result } = renderUseTus({
          autoAbort: true,
          autoStart: false,
        });

        const file: UploadFile = getBlob("hello");
        const options: UploadOptions = getDefaultOptions();

        expect(result.current.upload?.abort).toBeUndefined();

        act(() => {
          result.current.setUpload(file, options);
        });
        await waitFor(() => result.current.upload);

        expect(startOrResumeUploadMock).toBeCalledTimes(0);
      });

      it("Should call startOrResumeUpload function when autoStart is true", async () => {
        const { result } = renderUseTus({
          autoAbort: true,
          autoStart: true,
        });

        const file: UploadFile = getBlob("hello");
        const options: UploadOptions = getDefaultOptions();

        expect(result.current.upload?.abort).toBeUndefined();

        act(() => {
          result.current.setUpload(file, options);
        });
        await waitFor(() => result.current.upload);

        expect(startOrResumeUploadMock).toBeCalledTimes(1);
      });
    });
  });
});
