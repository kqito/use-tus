import { Upload } from 'tus-js-client';
import { renderHook, act } from '@testing-library/react-hooks';
import { TusClientProvider } from '../TusClientProvider';
import { useTus } from '../useTus';
import { getBlob } from './utils/getBlob';
import { ERROR_MESSAGES } from '../core/constants';
import { useTusClientState } from '../core/tusContexts';

const getDefaultOptions: () => Upload['options'] = () => ({
  endpoint: 'http://tus.io/uploads',
  uploadUrl: 'http://tus.io/files/upload',
  metadata: {
    filetype: 'text/plain',
  },
});

const actualTus = jest.requireActual<typeof import('tus-js-client')>(
  'tus-js-client'
);

describe('useTus', () => {
  it('Should generate tus instance', async () => {
    await act(async () => {
      const { result, waitForNextUpdate, rerender } = renderHook(
        ({ uploadKey }: { uploadKey: string }) => useTus(uploadKey),
        {
          initialProps: { uploadKey: 'test' },
          wrapper: ({ children }) => (
            <TusClientProvider>{children}</TusClientProvider>
          ),
        }
      );

      const file: Upload['file'] = getBlob('hello');
      const options: Upload['options'] = getDefaultOptions();

      expect(result.current.upload).toBeUndefined();
      expect(result.current.isSuccess).toBeFalsy();
      expect(result.current.error).toBeUndefined();
      expect(typeof result.current.setUpload).toBe('function');
      expect(typeof result.current.remove).toBe('function');

      result.current.setUpload(file, options);
      await waitForNextUpdate();
      expect(result.current.upload).toBeInstanceOf(Upload);
      expect(result.current.isSuccess).toBeFalsy();
      expect(result.current.error).toBeUndefined();
      expect(typeof result.current.setUpload).toBe('function');
      expect(typeof result.current.remove).toBe('function');

      rerender({ uploadKey: 'new' });
      expect(result.current.upload).toBeUndefined();
      expect(result.current.isSuccess).toBeFalsy();
      expect(result.current.error).toBeUndefined();
      expect(typeof result.current.setUpload).toBe('function');
      expect(typeof result.current.remove).toBe('function');

      rerender({ uploadKey: 'test' });
      expect(result.current.upload).toBeInstanceOf(Upload);
      expect(result.current.isSuccess).toBeFalsy();
      expect(result.current.error).toBeUndefined();
      expect(typeof result.current.setUpload).toBe('function');
      expect(typeof result.current.remove).toBe('function');

      result.current.remove();
      expect(result.current.upload).toBeUndefined();
      expect(result.current.isSuccess).toBeFalsy();
      expect(result.current.error).toBeUndefined();
      expect(typeof result.current.setUpload).toBe('function');
      expect(typeof result.current.remove).toBe('function');
    });
  });

  it('Should be reflected onto the TusClientProvider', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(
        ({ uploadKey }: { uploadKey: string }) => {
          const tus = useTus(uploadKey);
          const tusClientState = useTusClientState();

          return { tus, tusClientState };
        },
        {
          initialProps: { uploadKey: 'test' },
          wrapper: ({ children }) => (
            <TusClientProvider>{children}</TusClientProvider>
          ),
        }
      );

      const file: Upload['file'] = getBlob('hello');
      const options: Upload['options'] = {
        ...getDefaultOptions(),
      };

      result.current.tus.setUpload(file, options);
      await waitForNextUpdate();
      expect(result.current.tus.upload).toBeInstanceOf(Upload);

      await result.current.tus.upload?.abort(true);

      const pastTusClientState = result.all.find((_, i) => i === 0);
      expect(pastTusClientState).not.toBeUndefined();
      expect(pastTusClientState).not.toEqual(result.current.tusClientState);
    });
  });

  it('Should throw if the TusClientProvider has not found', async () => {
    await act(async () => {
      const { result } = renderHook(() => useTus(''));
      expect(result.error).toEqual(
        Error(ERROR_MESSAGES.tusClientHasNotFounded)
      );
    });
  });

  it('Should set tus config from context value', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(
        ({ uploadKey }: { uploadKey: string }) => {
          const tus = useTus(uploadKey);
          const tusClientState = useTusClientState();

          return { tus, tusClientState };
        },
        {
          initialProps: { uploadKey: 'test' },
          wrapper: ({ children }) => (
            <TusClientProvider
              canStoreURLs={false}
              defaultOptions={{ endpoint: 'hoge' }}
            >
              {children}
            </TusClientProvider>
          ),
        }
      );

      expect(result.current.tusClientState.tusHandler.getTus.canStoreURLs).toBe(
        false
      );
      expect(result.current.tusClientState.tusHandler.getTus.isSupported).toBe(
        actualTus.isSupported
      );
      expect(result.current.tusClientState.tusHandler.getTus.Upload).toBe(
        actualTus.Upload
      );
      expect(
        result.current.tusClientState.tusHandler.getTus.defaultOptions.endpoint
      ).toBe('hoge');

      const file: Upload['file'] = getBlob('hello');

      act(() => {
        result.current.tus.setUpload(file, {});
      });

      await waitForNextUpdate();

      expect(result.current.tus.upload).toBeInstanceOf(actualTus.Upload);
      expect(result.current.tus.upload?.options.endpoint).toBe('hoge');
    });
  });

  it('Should change isSuccess state on success', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(
        ({ uploadKey }: { uploadKey: string }) => useTus(uploadKey),
        {
          initialProps: { uploadKey: 'test' },
          wrapper: ({ children }) => (
            <TusClientProvider>{children}</TusClientProvider>
          ),
        }
      );

      expect(result.current.upload).toBeUndefined();
      expect(result.current.isSuccess).toBeFalsy();
      expect(result.current.error).toBeUndefined();
      expect(typeof result.current.setUpload).toBe('function');
      expect(typeof result.current.remove).toBe('function');

      result.current.setUpload(getBlob('hello'), getDefaultOptions());
      await waitForNextUpdate();

      expect(result.current.upload).toBeInstanceOf(Upload);
      expect(result.current.isSuccess).toBeFalsy();
      expect(result.current.error).toBeUndefined();
      expect(typeof result.current.setUpload).toBe('function');
      expect(typeof result.current.remove).toBe('function');

      const onSuccess = result.current.upload?.options?.onSuccess;
      if (!onSuccess) {
        throw new Error('onSuccess is falsly.');
      }

      onSuccess();

      expect(result.current.upload).toBeInstanceOf(Upload);
      expect(result.current.isSuccess).toBeTruthy();
      expect(result.current.error).toBeUndefined();
      expect(typeof result.current.setUpload).toBe('function');
      expect(typeof result.current.remove).toBe('function');
    });
  });

  it('Should change error state on error', async () => {
    await act(async () => {
      const { result, waitForNextUpdate } = renderHook(
        ({ uploadKey }: { uploadKey: string }) => useTus(uploadKey),
        {
          initialProps: { uploadKey: 'test' },
          wrapper: ({ children }) => (
            <TusClientProvider>{children}</TusClientProvider>
          ),
        }
      );

      expect(result.current.upload).toBeUndefined();
      expect(result.current.isSuccess).toBeFalsy();
      expect(result.current.error).toBeUndefined();
      expect(typeof result.current.setUpload).toBe('function');
      expect(typeof result.current.remove).toBe('function');

      result.current.setUpload(getBlob('hello'), getDefaultOptions());
      await waitForNextUpdate();

      expect(result.current.upload).toBeInstanceOf(Upload);
      expect(result.current.isSuccess).toBeFalsy();
      expect(result.current.error).toBeUndefined();
      expect(typeof result.current.setUpload).toBe('function');
      expect(typeof result.current.remove).toBe('function');

      const onError = result.current.upload?.options?.onError;
      if (!onError) {
        throw new Error('onError is falsly.');
      }

      onError(new Error());

      expect(result.current.upload).toBeInstanceOf(Upload);
      expect(result.current.isSuccess).toBeFalsy();
      expect(result.current.error).toEqual(new Error());
      expect(typeof result.current.setUpload).toBe('function');
      expect(typeof result.current.remove).toBe('function');
    });
  });
});
