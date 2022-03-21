import { Meta } from '@storybook/react';
import { ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
import { ProgressBar } from './components/ProgressBar';

import { TusClientProvider, DefaultOptions } from '../index';
import { BasicButton } from './components/BasicButton';
import { UploadIcon } from './components/UploadIcon';
import { LoadingCircle } from './components/LoadingCircle';
import { TUS_DEMO_ENDPOINT } from './constants';
import { useTusStore } from '../useTus';

export default {
  title: 'useTusStore hooks',
} as Meta;

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
  const { upload, setUpload, isSuccess, isAborted } = useTusStore('cacheKey', {
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
      <div className="flex flex-col items-center w-full min-h-screen p-2 border shadow md:shadow-none md:border-none md:w-8/12 rounded-xl md:p-6">
        <div className="mt-8">
          <UploadIcon />
        </div>
        <div className="flex flex-col items-center justify-center mt-8 text-sm text-gray-700">
          <p>
            Here is a demo with defaultOptions specified for TusClientProvider.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center mt-8 text-sm text-gray-700">
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
