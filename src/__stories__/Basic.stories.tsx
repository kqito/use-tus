import { Meta } from '@storybook/react';
import { useCallback, useRef, useState } from 'react';
import { ProgressBar } from './components/ProgressBar';

import { useTus, TusClientProvider } from '../index';
import { BasicButton } from './components/BasicButton';

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
  const { upload, setUpload, isSuccess, error } = useTus();
  const [progress, setProgress] = useState(0);

  console.log(upload);

  const handleOnSelectFile = () => {
    if (!inputRef.current) {
      return;
    }

    inputRef.current.click();
  };

  const handleOnSetUpload = useCallback(
    (event) => {
      const file = event.target.files.item(0);

      if (!file) {
        return;
      }

      setUpload(file, {
        endpoint: 'https://tusd.tusdemo.net/files/',
        chunkSize: 20000,
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
    console.log(upload);
  }, [upload]);

  const fileName = inputRef.current?.files?.item(0)?.name;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <p style={{ margin: 0 }}>use-tus</p>
        <p style={{ margin: 0 }}>File: {fileName || 'no selected'}</p>
        <input hidden type="file" onChange={handleOnSetUpload} ref={inputRef} />
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <BasicButton
            title="Select an image"
            styleColor="basic"
            onClick={handleOnSelectFile}
          />
          <BasicButton
            title="Start"
            styleColor="primary"
            onClick={handleOnStart}
            disabled={!upload}
          />
          <BasicButton
            title="Abort"
            styleColor="error"
            onClick={handleOnAbort}
            disabled={!upload}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <ProgressBar value={progress} />
      </div>
    </div>
  );
};
