import { Meta } from "@storybook/react";
import { ChangeEvent, useCallback, useMemo, useRef, useState } from "react";
import { ProgressBar } from "./components/ProgressBar";

import { TusClientProvider, DefaultOptions, useTusStore } from "../index";
import { BasicButton } from "./components/BasicButton";
import { UploadIcon } from "./components/UploadIcon";
import { LoadingCircle } from "./components/LoadingCircle";
import { TUS_DEMO_ENDPOINT } from "./constants";
import { FadeContent } from "./components/FadeContent";
import { ShinyText } from "./components/ShinyText";

export default {
  title: "useTusStore hooks",
} satisfies Meta;

const defaultOptions: DefaultOptions = (contents) => {
  const file = contents instanceof File ? contents : undefined;

  return {
    endpoint: TUS_DEMO_ENDPOINT,
    chunkSize: file?.size ? file.size / 10 : undefined,
    metadata: file
      ? {
          filename: file.name,
          filetype: file.type,
        }
      : undefined,
  };
};

export const WithDefaultOptions = () => (
  <TusClientProvider defaultOptions={defaultOptions}>
    <Uploader />
  </TusClientProvider>
);

const Uploader = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, setUpload, isSuccess, isAborted } = useTusStore("cacheKey", {
    autoStart: true,
  });
  const [progress, setProgress] = useState(0);
  const uploadedUrl = useMemo(
    () => isSuccess && upload?.url,
    [upload, isSuccess]
  );

  const handleOnSelectFile = () => {
    if (!inputRef.current) {
      return;
    }

    inputRef.current.click();
  };

  const handleOnSetUpload = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target?.files?.item(0);

      if (!file) {
        return;
      }

      setUpload(file, {
        onProgress: (bytesSent, bytesTotal) => {
          setProgress(Number(((bytesSent / bytesTotal) * 100).toFixed(2)));
        },
      });
    },
    [setUpload]
  );

  const handleOnStart = useCallback(() => {
    if (!upload) {
      return;
    }

    upload.start();
  }, [upload]);

  const handleOnAbort = useCallback(async () => {
    if (!upload) {
      return;
    }

    await upload.abort();
  }, [upload]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <FadeContent duration={500} className="w-full max-w-md">
        <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-8 pt-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <UploadIcon />
              <div>
                <h1 className="text-base font-semibold text-gray-900">
                  <ShinyText
                    text="Default Options Demo"
                    color="#111827"
                    shineColor="#6366F1"
                    speed={4}
                  />
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  Shared config via TusClientProvider
                </p>
              </div>
            </div>
          </div>
          <div className="px-8 py-6 space-y-6">
            <div className="text-sm text-gray-500 space-y-1 leading-relaxed">
              <p>
                This demo passes{" "}
                <code className="text-indigo-600 font-mono text-xs bg-indigo-50 px-1.5 py-0.5 rounded">
                  defaultOptions
                </code>{" "}
                to{" "}
                <code className="text-indigo-600 font-mono text-xs bg-indigo-50 px-1.5 py-0.5 rounded">
                  TusClientProvider
                </code>
                .
              </p>
              <p>Upload to the official tus demo server.</p>
            </div>
            <ProgressBar value={progress} />
            <input
              hidden
              type="file"
              onChange={handleOnSetUpload}
              ref={inputRef}
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <BasicButton
                title="Select file"
                styleColor="basic"
                onClick={handleOnSelectFile}
              />
              <BasicButton
                title="Resume"
                styleColor="primary"
                onClick={handleOnStart}
                disabled={isSuccess || !isAborted}
              />
              <BasicButton
                title="Abort"
                styleColor="error"
                onClick={handleOnAbort}
                disabled={isSuccess || !upload || isAborted}
              />
            </div>
            {upload && !isAborted && !isSuccess && (
              <div className="flex justify-center py-2">
                <LoadingCircle />
              </div>
            )}
            {isSuccess && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Upload complete
              </div>
            )}
            {uploadedUrl && (
              <div className="rounded-xl overflow-hidden border border-gray-100">
                <img src={uploadedUrl} alt="upload" className="w-full" />
              </div>
            )}
          </div>
        </div>
      </FadeContent>
    </div>
  );
};
