import { Upload } from "tus-js-client";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useTus, UseTusOptions } from "../useTus";
import { getBlob } from "./utils/getBlob";
import { createConsoleErrorMock, startOrResumeUploadMock } from "./utils/mock";
import { getDefaultOptions } from "./utils/getDefaultOptions";

/* eslint-disable no-console */

const originProcess = process;

const renderUseTus = (initialProps?: UseTusOptions) =>
  renderHook((props) => useTus(props), {
    initialProps,
  });

describe("useTus", () => {
  beforeEach(() => {
    window.process = originProcess;
    jest.resetAllMocks();
  });

  it("Should generate tus instance", async () => {
    const { result } = renderUseTus();

    const file: Upload["file"] = getBlob("hello");
    const options: Upload["options"] = getDefaultOptions();

    expect(result.current.upload).toBeUndefined();
    expect(result.current.isSuccess).toBeFalsy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isAborted).toBeFalsy();
    expect(typeof result.current.setUpload).toBe("function");
    expect(typeof result.current.remove).toBe("function");

    act(() => {
      result.current.setUpload(file, options);
    });
    await waitFor(() => result.current.upload);

    expect(result.current.upload).toBeInstanceOf(Upload);
    expect(result.current.isSuccess).toBeFalsy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isAborted).toBeFalsy();
    expect(typeof result.current.setUpload).toBe("function");
    expect(typeof result.current.remove).toBe("function");

    act(() => {
      result.current.remove();
    });
    await waitFor(() => result.current.upload);

    expect(result.current.upload).toBeUndefined();
    expect(result.current.isSuccess).toBeFalsy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isAborted).toBeFalsy();
    expect(typeof result.current.setUpload).toBe("function");
    expect(typeof result.current.remove).toBe("function");
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
    const { result } = renderUseTus();

    expect(result.current.upload).toBeUndefined();
    expect(result.current.isSuccess).toBeFalsy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isAborted).toBeFalsy();
    expect(typeof result.current.setUpload).toBe("function");
    expect(typeof result.current.remove).toBe("function");

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

    expect(result.current.upload).toBeInstanceOf(Upload);
    expect(result.current.isSuccess).toBeFalsy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isAborted).toBeFalsy();
    expect(typeof result.current.setUpload).toBe("function");
    expect(typeof result.current.remove).toBe("function");

    const onSuccess = result.current.upload?.options?.onSuccess;
    if (!onSuccess) {
      throw new Error("onSuccess is falsly.");
    }

    act(() => {
      onSuccess();
    });

    expect(result.current.upload).toBeInstanceOf(Upload);
    expect(result.current.isSuccess).toBeTruthy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isAborted).toBeFalsy();
    expect(typeof result.current.setUpload).toBe("function");
    expect(typeof result.current.remove).toBe("function");
    expect(consoleErrorMock).toHaveBeenCalledWith();
  });

  it("Should change error state on error", async () => {
    const { result } = renderUseTus();

    expect(result.current.upload).toBeUndefined();
    expect(result.current.isSuccess).toBeFalsy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isAborted).toBeFalsy();
    expect(typeof result.current.setUpload).toBe("function");
    expect(typeof result.current.remove).toBe("function");

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

    expect(result.current.upload).toBeInstanceOf(Upload);
    expect(result.current.isSuccess).toBeFalsy();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isAborted).toBeFalsy();
    expect(typeof result.current.setUpload).toBe("function");
    expect(typeof result.current.remove).toBe("function");

    const onError = result.current.upload?.options?.onError;
    if (!onError) {
      throw new Error("onError is falsly.");
    }

    act(() => {
      onError(new Error());
    });

    expect(result.current.upload).toBeInstanceOf(Upload);
    expect(result.current.isSuccess).toBeFalsy();
    expect(result.current.error).toEqual(new Error());
    expect(typeof result.current.setUpload).toBe("function");
    expect(typeof result.current.remove).toBe("function");
    expect(consoleErrorMock).toHaveBeenCalledWith();
  });
});

describe("Options", () => {
  describe("autoAbort", () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    it("Should abort on unmount", async () => {
      const { result, unmount } = renderUseTus({
        autoAbort: true,
      });

      const file: Upload["file"] = getBlob("hello");
      const options: Upload["options"] = getDefaultOptions();

      expect(result.current.upload?.abort).toBeUndefined();

      act(() => {
        result.current.setUpload(file, options);
      });
      await waitFor(() => (result.current.upload as any)._aborted);

      expect((result.current.upload as any)._aborted).toBeFalsy();

      act(() => {
        unmount();
      });
      await waitFor(() => (result.current.upload as any)._aborted);

      expect((result.current.upload as any)._aborted).toBeTruthy();
    });

    it("Should not abort on unmount", async () => {
      const { result, unmount } = renderUseTus({ autoAbort: false });

      const file: Upload["file"] = getBlob("hello");
      const options: Upload["options"] = getDefaultOptions();

      expect(result.current.upload?.abort).toBeUndefined();

      act(() => {
        result.current.setUpload(file, options);
      });
      await waitFor(() => (result.current.upload as any)._aborted);

      expect((result.current.upload as any)._aborted).toBeFalsy();

      unmount();

      expect((result.current.upload as any)._aborted).toBeFalsy();
    });
  });

  describe("autoStart", () => {
    it("Should not call startOrResumeUpload function when autoStart is false", async () => {
      const { result } = renderUseTus({
        autoAbort: true,
        autoStart: false,
      });

      const file: Upload["file"] = getBlob("hello");
      const options: Upload["options"] = getDefaultOptions();

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

      const file: Upload["file"] = getBlob("hello");
      const options: Upload["options"] = getDefaultOptions();

      expect(result.current.upload?.abort).toBeUndefined();

      act(() => {
        result.current.setUpload(file, options);
      });
      await waitFor(() => result.current.upload);

      expect(startOrResumeUploadMock).toBeCalledTimes(1);
    });
  });
});
