import * as tus from "tus-js-client";
import { render, act, renderHook, cleanup } from "@testing-library/react";
import { DefaultOptions, TusClientProvider } from "../TusClientProvider";
import { createConsoleErrorMock } from "./utils/mock";
import { getBlob } from "./utils/getBlob";
import { ERROR_MESSAGES } from "../TusClientProvider/constants";
import { useTusClientState } from "../TusClientProvider/store/contexts";

describe("TusClientProvider", () => {
  beforeEach(() => {
    // HACK: mock for isSupported property
    Object.defineProperty(tus, "isSupported", {
      get: jest.fn(() => true),
      set: jest.fn(),
    });

    cleanup();
  });

  it("Should output error message if the browser is not supoprted", () => {
    jest.spyOn(tus, "isSupported", "get").mockReturnValue(false);

    const consoleErrorMock = createConsoleErrorMock();

    act(() => {
      render(<TusClientProvider />);
    });

    expect(consoleErrorMock).toHaveBeenCalledWith(
      ERROR_MESSAGES.tusIsNotSupported
    );
  });

  describe("Should pass each props", () => {
    it("Nothing to pass", async () => {
      const { result } = renderHook(() => useTusClientState(), {
        wrapper: ({ children }) => (
          <TusClientProvider>{children}</TusClientProvider>
        ),
      });

      expect(result.current.defaultOptions?.(getBlob(""))).toBe(undefined);
    });

    it("defaultOptions", async () => {
      const defaultOptions: DefaultOptions = (file) => ({
        endpoint: "hoge",
        metadata:
          file instanceof File
            ? {
                filename: file.name,
                filetype: file.type,
              }
            : undefined,
      });

      const { result } = renderHook(() => useTusClientState(), {
        wrapper: ({ children }) => (
          <TusClientProvider defaultOptions={defaultOptions}>
            {children}
          </TusClientProvider>
        ),
      });

      expect(
        result.current.defaultOptions?.(new File([], "name", { type: "type" }))
      ).toStrictEqual({
        endpoint: "hoge",
        metadata: {
          filename: "name",
          filetype: "type",
        },
      });
    });
  });
});
