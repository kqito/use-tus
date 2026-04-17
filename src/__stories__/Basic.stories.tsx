import { Meta } from "@storybook/react";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProgressBar } from "./components/ProgressBar";

import { useTus } from "../index";
import { BasicButton } from "./components/BasicButton";
import { TUS_DEMO_ENDPOINT } from "./constants";
import { UploadIcon } from "./components/UploadIcon";
import { LoadingCircle } from "./components/LoadingCircle";
import { FadeContent } from "./components/FadeContent";
import { ShinyText } from "./components/ShinyText";

export default {
  title: "useTus",
} satisfies Meta;

export const Basic = () => <Uploader />;

const Uploader = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, setUpload, isSuccess, isAborted, isUploading } = useTus({
    autoStart: true,
  });

  const [progress, setProgress] = useState(0);
  const uploadedUrl = useMemo(() => isSuccess && upload?.url, [upload, isSuccess]);

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
        endpoint: TUS_DEMO_ENDPOINT,
        chunkSize: file.size / 10,
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
        onProgress: (bytesSent, bytesTotal, u) => {
          console.log("onProgress", u);
          setProgress(Number(((bytesSent / bytesTotal) * 100).toFixed(2)));
        },
        onSuccess: (u) => {
          console.log("onSuccess", u);
        },
        onError: (_, u) => {
          console.log("onError", u);
        },
        onShouldRetry: (error, u) => {
          console.log("onShouldRetry", error, u);
          return true;
        },
        onChunkComplete: (chunkSize, bytesAccepted, bytesTotal, u) => {
          console.log("onChunkComplete", chunkSize, bytesAccepted, bytesTotal, u);
        },
        onBeforeRequest: (request, u) => {
          console.log("onBeforeRequest", request, u);
        },
      });
    },
    [setUpload]
  );

  useEffect(() => {
    console.log("useEffect", upload?.url);
  }, [upload?.url]);

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
                  <ShinyText text="File Upload" color="#111827" shineColor="#6366F1" speed={4} />
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">Resumable uploads via tus protocol</p>
              </div>
            </div>
          </div>
          <div className="px-8 py-6 space-y-6">
            <p className="text-sm text-gray-500 leading-relaxed">
              Upload to the official tus demo server. Please be mindful of the files you choose to
              upload.
            </p>
            <ProgressBar value={progress} />
            <input hidden type="file" onChange={handleOnSetUpload} ref={inputRef} />
            <div className="flex flex-col sm:flex-row gap-3">
              <BasicButton title="Select file" styleColor="basic" onClick={handleOnSelectFile} />
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
            {isUploading && (
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
