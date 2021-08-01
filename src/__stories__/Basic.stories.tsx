import { Meta } from '@storybook/react';
import { ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
import { ProgressBar } from './components/ProgressBar';

import { useTus, TusClientProvider } from '../index';
import { BasicButton } from './components/BasicButton';
import { defaultOptions } from './constants';
import { UploadIcon } from './components/UploadIcon';
import { LoadingCircle } from './components/LoadingCircle';

export default {
  title: 'useTus',
} as Meta;

export const Basic = () => (
  <TusClientProvider>
    <Uploader />
  </TusClientProvider>
);

const Uploader = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, setUpload, isSuccess, isAborted } = useTus({
    autoStart: true,
  });
  const [progress, setProgress] = useState(0);
  const uploadedUrl = useMemo(() => isSuccess && upload?.url, [
    upload,
    isSuccess,
  ]);

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
        ...defaultOptions,
        chunkSize: file.size / 10,
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
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
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center w-full min-h-screen p-2 border shadow md:w-8/12 rounded-xl md:p-6">
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
            disabled={isSuccess || !upload || isAborted}
          />
        </div>
        {upload && !isAborted && !isSuccess && (
          <div className="mt-8">
            <LoadingCircle />
          </div>
        )}
        {uploadedUrl && (
          <div className="flex flex-col items-center flex-1 mt-8">
            <img src={uploadedUrl} alt="upload" />
          </div>
        )}
      </div>
    </div>
  );
};
