import { FC } from 'react';
import { Upload } from 'tus-js-client';
import { renderHook, act } from '@testing-library/react-hooks';
import {
  TusClientProvider,
  useTusClientState,
} from '../core/TusClientProvider';
import { useTus } from '../core/useTus';
import { getBlob } from './utils/getBlob';

const getDefaultOptions: () => Upload['options'] = () => ({
  endpoint: 'http://tus.io/uploads',
  uploadUrl: 'http://tus.io/files/upload',
  metadata: {
    filetype: 'text/plain',
  },
});

describe('useTus', () => {
  const wrapper: FC = ({ children }) => (
    <TusClientProvider>{children}</TusClientProvider>
  );

  it('Should generate tus instance', async () => {
    await act(async () => {
      const { result, waitForNextUpdate, rerender } = renderHook(
        ({ uploadKey }: { uploadKey: string }) => useTus(uploadKey),
        {
          initialProps: { uploadKey: 'test' },
          wrapper,
        }
      );

      const file: Upload['file'] = getBlob('hello');
      const options: Upload['options'] = getDefaultOptions();

      expect(result.current.upload).toBeUndefined();

      result.current.setUpload(file, options);
      await waitForNextUpdate();
      expect(result.current.upload).toEqual(new Upload(file, options));

      rerender({ uploadKey: 'new' });
      expect(result.current.upload).toBeUndefined();

      rerender({ uploadKey: 'test' });
      expect(result.current.upload).toEqual(new Upload(file, options));

      result.current.remove();
      expect(result.current.upload).toBeUndefined();
    });
  });

  it('Should be reflected onto the TusClientProvider', async () => {
    const useTusWithContextValue = (uploadKey: string) => {
      const tus = useTus(uploadKey);
      const tusClientState = useTusClientState();

      return { tus, tusClientState };
    };

    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(
        ({ uploadKey }: { uploadKey: string }) =>
          useTusWithContextValue(uploadKey),
        {
          initialProps: { uploadKey: 'test' },
          wrapper,
        }
      );

      const file: Upload['file'] = getBlob('hello');
      const options: Upload['options'] = {
        ...getDefaultOptions(),
      };

      result.current.tus.setUpload(file, options);
      await waitForNextUpdate();
      expect(result.current.tus.upload).toEqual(new Upload(file, options));

      await result.current.tus.upload?.abort(true);

      const pastTusClientState = result.all.find((_, i) => i === 0);
      expect(pastTusClientState).not.toBeUndefined();
      expect(pastTusClientState).not.toEqual(result.current.tusClientState);
    });
  });
});
