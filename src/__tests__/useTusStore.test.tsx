import { renderHook, act, waitFor } from "@testing-library/react";
import {
  TusClientProvider,
  TusClientProviderProps,
} from "../TusClientProvider";
import { getBlob } from "./utils/getBlob";
import { getDefaultOptions } from "./utils/getDefaultOptions";
import { DefaultOptions, TusHooksOptions, useTusStore } from "..";
import {
  useTusClientState,
  useTusClientDispatch,
} from "../TusClientProvider/store/contexts";
import {
  insertEnvValue,
  createConsoleErrorMock,
  startOrResumeUploadMock,
  createUploadMock,
} from "./utils/mock";
import { ERROR_MESSAGES } from "../TusClientProvider/constants";
import { UploadFile } from "../types";

/* eslint-disable no-console */

const originProcess = process;
const start = jest.fn();
const abort = jest.fn();
const Upload = createUploadMock(start, abort);

const actualTus =
  jest.requireActual<typeof import("tus-js-client")>("tus-js-client");

type InitialProps = {
  cacheKey?: string;
  options?: TusHooksOptions;
};
const renderUseTusStore = (
  // eslint-disable-next-line default-param-last
  initialProps: InitialProps = {},
  providerProps?: TusClientProviderProps
) => {
  const result = renderHook(
    ({ cacheKey, options }) => {
      const tus = useTusStore(cacheKey ?? "test", options);
      const tusClientState = useTusClientState();

      return { tus, tusClientState };
    },
    {
      initialProps,
      wrapper: ({ children }) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <TusClientProvider {...providerProps}>{children}</TusClientProvider>
      ),
    }
  );

  return result;
};

describe("useTusStore", () => {
  beforeEach(() => {
    window.process = originProcess;
    jest.resetAllMocks();
  });

  describe("Uploading", () => {
    it("Should generate tus instance", async () => {
      const { result, rerender } = renderUseTusStore({
        cacheKey: "test1",
        options: { Upload },
      });

      const file: UploadFile = getBlob("hello");
      const options = getDefaultOptions();

      expect(result.current.tus).toEqual({
        upload: undefined,
        isSuccess: false,
        error: undefined,
        isAborted: false,
        isUploading: false,
        setUpload: expect.any(Function),
        remove: expect.any(Function),
      });

      act(() => {
        result.current.tus.setUpload(file, options);
      });

      expect(result.current.tus).toEqual({
        upload: expect.any(Upload),
        isSuccess: false,
        error: undefined,
        isAborted: false,
        isUploading: false,
        setUpload: expect.any(Function),
        remove: expect.any(Function),
      });

      rerender({ cacheKey: "test2" });
      expect(result.current.tus).toEqual({
        upload: undefined,
        isSuccess: false,
        error: undefined,
        isAborted: false,
        isUploading: false,
        setUpload: expect.any(Function),
        remove: expect.any(Function),
      });

      rerender({ cacheKey: "test1" });
      expect(result.current.tus).toEqual({
        upload: expect.any(Upload),
        isSuccess: false,
        error: undefined,
        isAborted: true,
        isUploading: false,
        setUpload: expect.any(Function),
        remove: expect.any(Function),
      });

      act(() => {
        result.current.tus.remove();
      });
      expect(result.current.tus).toEqual({
        upload: undefined,
        isSuccess: false,
        error: undefined,
        isAborted: false,
        isUploading: false,
        setUpload: expect.any(Function),
        remove: expect.any(Function),
      });
    });
  });

  it("Should be reflected onto the TusClientProvider", async () => {
    const { result } = renderUseTusStore({
      cacheKey: "test",
      options: { Upload },
    });

    const file: UploadFile = getBlob("hello");
    const options = {
      ...getDefaultOptions(),
    };

    expect(result.current.tus.upload).toBeUndefined();
    expect(result.current.tusClientState.defaultOptions).toBeUndefined();
    expect(result.current.tusClientState.uploads).toEqual({});

    act(() => {
      result.current.tus.setUpload(file, options);
    });

    await waitFor(() => result.current.tus.upload);

    const currentTus = result.current.tus;
    expect(currentTus.upload).toBeInstanceOf(Upload);
    expect(result.current.tusClientState.defaultOptions).toBeUndefined();
    expect(result.current.tusClientState.uploads.test).toBeInstanceOf(Object);
  });

  it("Should setUpload without option args", async () => {
    const defaultOptions: DefaultOptions = () => ({
      endpoint: "hoge",
      chunkSize: 100,
      Upload,
    });

    const { result } = renderUseTusStore(undefined, {
      defaultOptions,
    });

    act(() => {
      result.current.tus.setUpload(getBlob("hello"), {
        endpoint: "hogehoge",
        uploadSize: 1000,
      });
    });

    await waitFor(() => result.current.tus.upload?.options);

    expect(result.current.tus.upload?.options.endpoint).toBe("hogehoge");
    expect(result.current.tus.upload?.options.chunkSize).toBe(100);
    expect(result.current.tus.upload?.options.uploadSize).toBe(1000);
  });

  describe("Should throw if the TusClientProvider has not found on development env", () => {
    beforeEach(() => {
      createConsoleErrorMock();
      insertEnvValue({ NODE_ENV: "development" });
    });

    it("useTus", async () => {
      const targetFn = () => renderHook(() => useTusStore(""));
      expect(targetFn).toThrow(Error(ERROR_MESSAGES.tusClientHasNotFounded));
    });

    it("useTusClientState", async () => {
      const targetFn = () => renderHook(() => useTusClientState());
      expect(targetFn).toThrow(Error(ERROR_MESSAGES.tusClientHasNotFounded));
    });

    it("useTusClientDispatch", async () => {
      const targetFn = () => renderHook(() => useTusClientDispatch());
      expect(targetFn).toThrow(Error(ERROR_MESSAGES.tusClientHasNotFounded));
    });
  });

  describe("Should not throw even if the TusClientProvider has not found on production env", () => {
    beforeEach(() => {
      insertEnvValue({ NODE_ENV: "production" });
    });

    it("useTus", async () => {
      const targetFn = () => renderHook(() => useTusStore(""));
      expect(targetFn).toThrow(TypeError);
    });

    it("useTusClientState", async () => {
      const targetFn = () => renderHook(() => useTusClientState());
      expect(targetFn).not.toThrow();
    });

    it("useTusClientDispatch", async () => {
      const targetFn = () => renderHook(() => useTusClientDispatch());
      expect(targetFn).not.toThrow();
    });
  });

  it("Should set tus config from context value", async () => {
    const defaultOptions: DefaultOptions = () => ({
      endpoint: "hoge",
    });

    const { result } = renderUseTusStore(undefined, {
      defaultOptions,
    });

    expect(
      result.current.tusClientState.defaultOptions?.(getBlob("hello")).endpoint
    ).toBe("hoge");

    const file: UploadFile = getBlob("hello");

    act(() => {
      result.current.tus.setUpload(file, {});
    });

    await waitFor(() => result.current.tus.upload);

    expect(result.current.tus.upload).toBeInstanceOf(actualTus.Upload);
    expect(result.current.tus.upload?.options.endpoint).toBe("hoge");
  });

  it("Should change isSuccess state on success", async () => {
    const { result } = renderUseTusStore({ options: { Upload } });

    expect(result.current.tus).toEqual({
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
      result.current.tus.setUpload(getBlob("hello"), {
        ...getDefaultOptions(),
        onSuccess: () => {
          console.error();
        },
      });
    });

    await waitFor(() => result.current.tus.upload);

    expect(result.current.tus).toEqual({
      upload: expect.any(Upload),
      isSuccess: false,
      error: undefined,
      isAborted: false,
      isUploading: false,
      setUpload: expect.any(Function),
      remove: expect.any(Function),
    });

    const onSuccess = result.current.tus.upload?.options?.onSuccess;
    if (!onSuccess) {
      throw new Error("onSuccess is falsly.");
    }

    act(() => {
      onSuccess();
    });

    expect(result.current.tus).toEqual({
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

  it("Should change error state on error", async () => {
    const { result } = renderUseTusStore({ options: { Upload } });
    expect(result.current.tus).toEqual({
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
      result.current.tus.setUpload(getBlob("hello"), {
        ...getDefaultOptions(),
        onError: () => {
          console.error();
        },
      });
    });

    await waitFor(() => result.current.tus.upload);

    expect(result.current.tus).toEqual({
      upload: expect.any(Upload),
      isSuccess: false,
      error: undefined,
      isAborted: false,
      isUploading: false,
      setUpload: expect.any(Function),
      remove: expect.any(Function),
    });

    const onError = result.current.tus.upload?.options?.onError;
    if (!onError) {
      throw new Error("onError is falsly.");
    }

    act(() => {
      onError(new Error());
    });

    expect(result.current.tus).toEqual({
      upload: expect.any(Upload),
      isSuccess: false,
      error: new Error(),
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
        const { result, rerender, unmount } = renderUseTusStore({
          cacheKey: "test1",
          options: { autoAbort: true, Upload },
        });

        const file: UploadFile = getBlob("hello");
        const options = getDefaultOptions();

        expect(result.current.tus.upload?.abort).toBeUndefined();

        act(() => {
          result.current.tus.setUpload(file, options);
        });
        await waitFor(() => result.current.tus.upload);

        expect(abort).not.toHaveBeenCalled();

        rerender({ cacheKey: "test2", options: { autoAbort: true } });
        expect(abort).toBeCalledTimes(1);

        rerender({ cacheKey: "test1", options: { autoAbort: true } });
        expect(abort).toBeCalledTimes(1);

        unmount();
        expect(abort).toBeCalledTimes(2);
      });

      it("Should not abort on unmount", async () => {
        const { result, rerender, unmount } = renderUseTusStore({
          cacheKey: "test1",
          options: { autoAbort: false, Upload },
        });

        const file: UploadFile = getBlob("hello");
        const options = getDefaultOptions();

        expect(result.current.tus.upload?.abort).toBeUndefined();

        act(() => {
          result.current.tus.setUpload(file, options);
        });
        await waitFor(() => result.current.tus.upload);
        expect(abort).not.toHaveBeenCalled();

        rerender({ cacheKey: "test2", options: { autoAbort: false } });
        expect(abort).not.toHaveBeenCalled();

        rerender({ cacheKey: "test1", options: { autoAbort: false } });
        expect(abort).not.toHaveBeenCalled();

        unmount();
        expect(abort).not.toHaveBeenCalled();
      });
    });

    describe("autoStart", () => {
      it("Should not call startOrResumeUpload function when autoStart is false", async () => {
        const { result } = renderUseTusStore({
          options: { autoAbort: true, autoStart: false, Upload },
        });

        const file: UploadFile = getBlob("hello");
        const options = getDefaultOptions();

        expect(result.current.tus.upload?.abort).toBeUndefined();

        act(() => {
          result.current.tus.setUpload(file, options);
        });
        await waitFor(() => result.current.tus.upload);

        expect(startOrResumeUploadMock).toBeCalledTimes(0);
      });

      it("Should call startOrResumeUpload function when autoStart is true", async () => {
        const { result } = renderUseTusStore({
          options: { autoAbort: true, autoStart: true, Upload },
        });

        const file: UploadFile = getBlob("hello");
        const options = getDefaultOptions();

        act(() => {
          expect(result.current.tus.upload?.abort).toBeUndefined();
        });

        result.current.tus.setUpload(file, options);
        await waitFor(() => result.current.tus.upload);

        expect(startOrResumeUploadMock).toBeCalledTimes(1);
      });
    });
  });
});
