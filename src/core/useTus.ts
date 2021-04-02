import { Upload } from 'tus-js-client';
import { insertUploadInstance, useTusClient } from './TusClientProvider';

export const useTus = (uploadKey: string) => {
  const { uploads, dispatch } = useTusClient();
  const upload = uploads[uploadKey] || undefined;

  const setUpload = (file: Upload['file'], options: Upload['options']) => {
    if (!dispatch) {
      return;
    }

    dispatch(insertUploadInstance(uploadKey, new Upload(file, options)));
  };

  return { upload, setUpload };
};
