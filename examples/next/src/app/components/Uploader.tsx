"use client";

import { useRef, useState, useMemo, useCallback, ChangeEvent } from "react";
import { useTus } from "use-tus";
import { BasicButton } from "./BasicButton";
import { Loading } from "./Loading";
import { ProgressBar } from "./ProgressBar";
import { UploadIcon } from "./UploadIcon";

export const TUS_DEMO_ENDPOINT = "https://tusd.tusdemo.net/files/";

export const Uploader = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, setUpload, isSuccess, isAborted, isUploading } = useTus({
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
        endpoint: TUS_DEMO_ENDPOINT,
        chunkSize: file.size / 10,
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
        onProgress: (bytesSent, bytesTotal) => {
          setProgress(Number(((bytesSent / bytesTotal) * 100).toFixed(2)));
        },
        onSuccess: (upload) => {
          // eslint-disable-next-line no-console
          console.info("upload success", upload.url);
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
    <div className="flex flex-col items-center w-full border shadow md:shadow-none md:border-none rounded-xl md:p-6">
      <div className="mt-8">
        <UploadIcon />
      </div>
      <div className="mt-8 flex justify-center items-center flex-col text-sm text-gray-700">
        <p>
          In this demo, you can upload to the demo-only server provided by tus
          official.
        </p>
        <p>Also, please be careful about the images you upload.</p>
      </div>
      <div className="w-full mt-4 md:w-6/12">
        <ProgressBar value={progress} title={`${progress}%`} />
      </div>
      <input hidden type="file" onChange={handleOnSetUpload} ref={inputRef} />
      <div className="flex flex-col items-center w-full mt-8 md:flex-row gap-4">
        <BasicButton
          title="Select an image"
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
          disabled={!isUploading}
        />
      </div>
      {isUploading && (
        <div className="mt-8">
          <Loading />
        </div>
      )}
      {uploadedUrl && (
        <div className="flex flex-col items-center flex-1 mt-8">
          <img src={uploadedUrl} alt="upload" />
        </div>
      )}
    </div>
  );
};
