import { Upload } from 'tus-js-client';
import { renderHook, act } from '@testing-library/react-hooks';
import {
  TusClientProvider,
  TusClientProviderProps,
} from '../TusClientProvider';
import { useTusStore, UseTusOptions, UseTusResult } from '../useTus';
import { getBlob } from './utils/getBlob';
import { ERROR_MESSAGES } from '../core/constants';
import { useTusClientDispatch, useTusClientState } from '../core/contexts';
import {
  createConsoleErrorMock,
  insertEnvValue,
  startOrResumeUploadMock,
} from './utils/mock';
import { TusClientState } from '../core/tusClientReducer';
import { DefaultOptions } from '../core/tusHandler';
import { getDefaultOptions } from './utils/getDefaultOptions';

/* eslint-disable no-console */

const originProcess = process;
const actualTus = jest.requireActual<typeof import('tus-js-client')>(
  'tus-js-client'
);

type InitialProps = {
  cacheKey?: string;
  options?: UseTusOptions;
};
const renderUseTusStore = (
  initialProps: InitialProps = {},
  providerProps?: TusClientProviderProps
) => {
  const result = renderHook<
    InitialProps,
    {
      tus: UseTusResult;
      tusClientState: TusClientState;
    }
  >(
    ({ cacheKey, options }) => {
      const tus = useTusStore(cacheKey ?? 'test', options);
      const tusClientState = useTusClientState();

      return { tus, tusClientState };
    },
    {
      initialProps,
      wrapper: ({ children }) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <TusClientProvider {...providerProps}>{children}</TusClientProvider>
      ),
    }
  );

  return result;
};

describe('useTusStore', () => {
  beforeEach(() => {
    window.process = originProcess;
    jest.resetAllMocks();
  });

  it('Should generate tus instance', async () => {
    const { result, rerender } = renderUseTusStore({
      cacheKey: 'test1',
    });

    const file: Upload['file'] = getBlob('hello');
    const options: Upload['options'] = getDefaultOptions();

    expect(result.current.tus.upload).toBeUndefined();
    expect(result.current.tus.isSuccess).toBeFalsy();
    expect(result.current.tus.error).toBeUndefined();
    expect(result.current.tus.isAborted).toBeFalsy();
    expect(typeof result.current.tus.setUpload).toBe('function');
    expect(typeof result.current.tus.remove).toBe('function');

    act(() => {
      result.current.tus.setUpload(file, options);
    });

    expect(result.current.tus.upload).toBeInstanceOf(Upload);
    expect(result.current.tus.isSuccess).toBeFalsy();
    expect(result.current.tus.error).toBeUndefined();
    expect(result.current.tus.isAborted).toBeFalsy();
    expect(typeof result.current.tus.setUpload).toBe('function');
    expect(typeof result.current.tus.remove).toBe('function');

    rerender({ cacheKey: 'test2' });
    expect(result.current.tus.upload).toBeUndefined();
    expect(result.current.tus.isSuccess).toBeFalsy();
    expect(result.current.tus.error).toBeUndefined();
    expect(result.current.tus.isAborted).toBeFalsy();
    expect(typeof result.current.tus.setUpload).toBe('function');
    expect(typeof result.current.tus.remove).toBe('function');

    rerender({ cacheKey: 'test1' });
    expect(result.current.tus.upload).toBeInstanceOf(Upload);
    expect(result.current.tus.isSuccess).toBeFalsy();
    expect(result.current.tus.error).toBeUndefined();
    expect(result.current.tus.isAborted).toBeTruthy();
    expect(typeof result.current.tus.setUpload).toBe('function');
    expect(typeof result.current.tus.remove).toBe('function');

    act(() => {
      result.current.tus.remove();
    });

    expect(result.current.tus.upload).toBeUndefined();
    expect(result.current.tus.isSuccess).toBeFalsy();
    expect(result.current.tus.error).toBeUndefined();
    expect(result.current.tus.isAborted).toBeFalsy();
    expect(typeof result.current.tus.setUpload).toBe('function');
    expect(typeof result.current.tus.remove).toBe('function');
  });
});

it('Should be reflected onto the TusClientProvider', async () => {
  await act(async () => {
    const { result, waitForNextUpdate } = renderUseTusStore();

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

it('Should setUpload without option args', async () => {
  const defaultOptions: DefaultOptions = () => ({
    endpoint: 'hoge',
    chunkSize: 100,
  });

  await act(async () => {
    const { result, waitForNextUpdate } = renderUseTusStore(undefined, {
      defaultOptions,
    });

    result.current.tus.setUpload(getBlob('hello'), {
      endpoint: 'hogehoge',
      uploadSize: 1000,
    });
    await waitForNextUpdate();

    expect(result.current.tus.upload?.options.endpoint).toBe('hogehoge');
    expect(result.current.tus.upload?.options.chunkSize).toBe(100);
    expect(result.current.tus.upload?.options.uploadSize).toBe(1000);
  });
});

describe('Should throw if the TusClientProvider has not found on development env', () => {
  beforeEach(() => {
    insertEnvValue({ NODE_ENV: 'development' });
  });

  it('useTus', async () => {
    const { result } = renderHook(() => useTusStore(''));
    expect(result.error).toEqual(Error(ERROR_MESSAGES.tusClientHasNotFounded));
  });

  it('useTusClientState', async () => {
    const { result } = renderHook(() => useTusClientState());
    expect(result.error).toEqual(Error(ERROR_MESSAGES.tusClientHasNotFounded));
  });

  it('useTusClientDispatch', async () => {
    const { result } = renderHook(() => useTusClientDispatch());
    expect(result.error).toEqual(Error(ERROR_MESSAGES.tusClientHasNotFounded));
  });
});

describe('Should not throw even if the TusClientProvider has not found on production env', () => {
  beforeEach(() => {
    insertEnvValue({ NODE_ENV: 'production' });
  });

  it('useTus', async () => {
    const { result } = renderHook(() => useTusStore(''));
    expect(result.error).toBeInstanceOf(TypeError);
  });

  it('useTusClientState', async () => {
    const { result } = renderHook(() => useTusClientState());
    expect(result.error).toEqual(undefined);
  });

  it('useTusClientDispatch', async () => {
    const { result } = renderHook(() => useTusClientDispatch());
    expect(result.error).toEqual(undefined);
  });
});

it('Should set tus config from context value', async () => {
  const defaultOptions: DefaultOptions = () => ({
    endpoint: 'hoge',
  });

  await act(async () => {
    const { result, waitForNextUpdate } = renderUseTusStore(undefined, {
      canStoreURLs: false,
      defaultOptions,
    });

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
      result.current.tusClientState.tusHandler.getTus.defaultOptions(
        getBlob('hello')
      ).endpoint
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
    const { result, waitForNextUpdate } = renderUseTusStore();

    expect(result.current.tus.upload).toBeUndefined();
    expect(result.current.tus.isSuccess).toBeFalsy();
    expect(result.current.tus.error).toBeUndefined();
    expect(result.current.tus.isAborted).toBeFalsy();
    expect(typeof result.current.tus.setUpload).toBe('function');
    expect(typeof result.current.tus.remove).toBe('function');

    const consoleErrorMock = createConsoleErrorMock();
    result.current.tus.setUpload(getBlob('hello'), {
      ...getDefaultOptions(),
      onSuccess: () => {
        console.error();
      },
    });
    await waitForNextUpdate();

    expect(result.current.tus.upload).toBeInstanceOf(Upload);
    expect(result.current.tus.isSuccess).toBeFalsy();
    expect(result.current.tus.error).toBeUndefined();
    expect(result.current.tus.isAborted).toBeFalsy();
    expect(typeof result.current.tus.setUpload).toBe('function');
    expect(typeof result.current.tus.remove).toBe('function');

    const onSuccess = result.current.tus.upload?.options?.onSuccess;
    if (!onSuccess) {
      throw new Error('onSuccess is falsly.');
    }

    onSuccess();

    expect(result.current.tus.upload).toBeInstanceOf(Upload);
    expect(result.current.tus.isSuccess).toBeTruthy();
    expect(result.current.tus.error).toBeUndefined();
    expect(result.current.tus.isAborted).toBeFalsy();
    expect(typeof result.current.tus.setUpload).toBe('function');
    expect(typeof result.current.tus.remove).toBe('function');
    expect(consoleErrorMock).toHaveBeenCalledWith();
  });
});

it('Should change error state on error', async () => {
  await act(async () => {
    const { result, waitForNextUpdate } = renderUseTusStore();
    expect(result.current.tus.upload).toBeUndefined();
    expect(result.current.tus.isSuccess).toBeFalsy();
    expect(result.current.tus.error).toBeUndefined();
    expect(result.current.tus.isAborted).toBeFalsy();
    expect(typeof result.current.tus.setUpload).toBe('function');
    expect(typeof result.current.tus.remove).toBe('function');

    const consoleErrorMock = createConsoleErrorMock();
    result.current.tus.setUpload(getBlob('hello'), {
      ...getDefaultOptions(),
      onError: () => {
        console.error();
      },
    });
    await waitForNextUpdate();

    expect(result.current.tus.upload).toBeInstanceOf(Upload);
    expect(result.current.tus.isSuccess).toBeFalsy();
    expect(result.current.tus.error).toBeUndefined();
    expect(result.current.tus.isAborted).toBeFalsy();
    expect(typeof result.current.tus.setUpload).toBe('function');
    expect(typeof result.current.tus.remove).toBe('function');

    const onError = result.current.tus.upload?.options?.onError;
    if (!onError) {
      throw new Error('onError is falsly.');
    }

    onError(new Error());

    expect(result.current.tus.upload).toBeInstanceOf(Upload);
    expect(result.current.tus.isSuccess).toBeFalsy();
    expect(result.current.tus.error).toEqual(new Error());
    expect(typeof result.current.tus.setUpload).toBe('function');
    expect(typeof result.current.tus.remove).toBe('function');
    expect(consoleErrorMock).toHaveBeenCalledWith();
  });
});

describe('Options', () => {
  describe('autoAbort', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    it('Should abort on unmount', async () => {
      await act(async () => {
        const {
          result,
          waitForNextUpdate,
          unmount,
          waitForValueToChange,
        } = renderUseTusStore({ options: { autoAbort: true } });

        const file: Upload['file'] = getBlob('hello');
        const options: Upload['options'] = getDefaultOptions();

        expect(result.current.tus.upload?.abort).toBeUndefined();

        result.current.tus.setUpload(file, options);
        await waitForNextUpdate();

        expect(
          (result.current.tusClientState.uploads?.test?.upload as any)._aborted
        ).toBeFalsy();

        unmount();
        await waitForValueToChange(
          () =>
            (result.current.tusClientState.uploads?.test?.upload as any)
              ._aborted
        );

        expect(
          (result.current.tusClientState.uploads?.test?.upload as any)._aborted
        ).toBeTruthy();
      });
    });

    it('Should not abort on unmount', async () => {
      await act(async () => {
        const { result, waitForNextUpdate, unmount } = renderUseTusStore({
          options: { autoAbort: false },
        });

        const file: Upload['file'] = getBlob('hello');
        const options: Upload['options'] = getDefaultOptions();

        expect(result.current.tus.upload?.abort).toBeUndefined();

        result.current.tus.setUpload(file, options);
        await waitForNextUpdate();

        expect(
          (result.current.tusClientState.uploads?.test?.upload as any)._aborted
        ).toBeFalsy();

        unmount();

        expect(
          (result.current.tusClientState.uploads?.test?.upload as any)._aborted
        ).toBeFalsy();
      });
    });
  });

  describe('autoStart', () => {
    it('Should not call startOrResumeUpload function when autoStart is false', async () => {
      await act(async () => {
        const { result, waitForNextUpdate } = renderUseTusStore({
          options: { autoAbort: true, autoStart: false },
        });

        const file: Upload['file'] = getBlob('hello');
        const options: Upload['options'] = getDefaultOptions();

        expect(result.current.tus.upload?.abort).toBeUndefined();

        result.current.tus.setUpload(file, options);
        await waitForNextUpdate();

        expect(startOrResumeUploadMock).toBeCalledTimes(0);
      });
    });

    it('Should call startOrResumeUpload function when autoStart is true', async () => {
      await act(async () => {
        const { result, waitForNextUpdate } = renderUseTusStore({
          options: { autoAbort: true, autoStart: true },
        });

        const file: Upload['file'] = getBlob('hello');
        const options: Upload['options'] = getDefaultOptions();

        expect(result.current.tus.upload?.abort).toBeUndefined();

        result.current.tus.setUpload(file, options);
        await waitForNextUpdate();

        expect(startOrResumeUploadMock).toBeCalledTimes(1);
      });
    });
  });
});
