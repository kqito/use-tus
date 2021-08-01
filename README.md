<h3 align="center">
  use-tus
</h3>

<p align="center">
  React hooks for resumable file uploads using <a href="https://github.com/tus/tus-js-client">tus</a>.
</p>

<p align="center">
  <a href="https://github.com/kqito/use-tus/actions/workflows/test.yml"><img src="https://github.com/kqito/use-tus/workflows/Test/badge.svg" alt="Build status"></a>
  <a href="https://badge.fury.io/js/use-tus"><img src="https://badge.fury.io/js/use-tus.svg" alt="Npm version"></a>
  <a href="https://github.com/kqito/use-tus/blob/main/LICENSE"><img src="https://img.shields.io/github/license/kqito/use-tus" alt="License"></a>
</p>

## Features
- Resumable file uploads on react.
- Managing the [Upload](https://github.com/tus/tus-js-client/blob/master/docs/api.md#tusuploadfile-options) by using context.
- One dependency ([tus-js-client](https://github.com/tus/tus-js-client)).
- TypeScript support.

## Demo
You can try the [use-tus demo](https://kqito.github.io/use-tus/?path=/story/usetus--basic).


## Installation
You can install the package from npm.
```sh
npm install use-tus
```

or
```sh
yarn add use-tus
```

## Usage
We can use `useTus` as following.

```tsx
import { useTus, TusClientProvider } from 'use-tus'

const App = () => (
  <TusClientProvider>
    <Uploader />
  </TusClientProvider>
);

const Uploader = () => {
  const { upload, setUpload, isSuccess, error, remove } = useTus();

  const handleSetUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files.item(0);

      if (!file) {
        return;
      }

      setUpload(file, {
        endpoint: 'https://tusd.tusdemo.net/files/',
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
      });
    },
    [setUpload]
  );

  const handleStart = useCallback(() => {
    if (!upload) {
      return;
    }

    // Start upload the file.
    upload.start();
  }, [upload]);

  return (
    <div>
      <input type="file" onChange={handleSetUpload} />
      <button type="button" onClick={handleStart}>
        Upload
      </button>
    </div>
  );
};
```


## API
### `useTus` hooks

```tsx
const { upload, setUpload, isSuccess, isAborted, error, remove } = useTus({ cacheKey, autoAbort, autoStart });
```

`useTus` is a hooks to get or create an `Upload` of tus.

### Arguments
- `cacheKey` (type: `string | undefined`)
  - Specify the key associated with the `Upload` if it's undefined, a random string will be specified.

- `autoAbort` (type: `boolean | undefined`) (default: true)
  - Whether or not to automatically abort uploads when useTus hooks is unmounted.

- `autoStart` (type: `boolean | undefined`) (default: false)
  - Whether or not to start upload the file after `setUpload` function.

### Returns
- `upload` (type: `tus.Upload | undefined`)
  - The value of the `Upload` associated with the cacheKey in the TusClientProvider. If not present, undefined.

- `setUpload` (type: `(file: tus.Upload['file'], options?: tus.Upload['options']) => void`)
  - Function to create an `Upload` and store it in TusClientProvider.

- `isSuccess` (type: `boolean`)
  - Whether the upload was successful or not.

- `isAborted` (type: `boolean`)
  - Whether the upload was aborted or not.

- `error` (type: `Error | undefined`)
  - Error when upload fails.

- `remove` (type: `() => void`)
  - Function to delete the `Upload` associated with cacheKey.

### `TusClientProvider`

```tsx
() => (
  <TusClientProvider>
    {children}
  </TusClientProvider>
)
```

`TusClientProvider` is the provider that stores the `Upload` with `useTus` hooks.

**In order to use `useTus`, you need to set `TusClientProvider`.**

### Props
- `canStoreURLs` (type: `boolean | undefined`)
  - A boolean indicating whether the current environment allows storing URLs enabling the corresponding upload to be resumed. [detail](https://github.com/tus/tus-js-client/blob/master/docs/api.md#tuscanstoreurls)

- `defaultOptions` (type: `tus.DefaltOptions | undefined`)
  - An object containing the default options used when creating a new upload. [detail](https://github.com/tus/tus-js-client/blob/master/docs/api.md#tusdefaultoptions)

## Examples
The following are some example of how to use `use-tus`.

Note that the `TusClientProvider` must be specified as the parent or higher element.

### Uploading a file
The setUpload and `upload.start` functions can be used to perform resumable file uploads.

```tsx
import { useTus } from 'use-tus'

const Uploader = () => {
  const { upload, setUpload } = useTus();

  const handleSetUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files.item(0);

      if (!file) {
        return;
      }

      setUpload(file, {
        endpoint: 'https://tusd.tusdemo.net/files/',
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
      });
    },
    [setUpload]
  );

  const handleStart = useCallback(() => {
    if (!upload) {
      return;
    }

    // Start upload the file.
    upload.start();
  }, [upload]);

  return (
    <div>
      <input type="file" onChange={handleSetUpload} />
      <button type="button" onClick={handleStart}>
        Upload
      </button>
    </div>
  );
};
```

It is also possible to automatically upload files after setUpload by specifying the `autoStart` option.

```tsx
import { useTus } from 'use-tus'

const Uploader = () => {
  const { upload, setUpload } = useTus({ autoStart: true });

  const handleSetUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files.item(0);

      if (!file) {
        return;
      }

      setUpload(file, {
        endpoint: 'https://tusd.tusdemo.net/files/',
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
      });
    },
    [setUpload]
  );
  return (
    <input type="file" onChange={handleSetUpload} />
  );
};
```

### Aborting a file upload
You can abort the upload by using the `upload.abort` function.

```tsx
import { useTus } from 'use-tus'

const Aborter = () => {
  const { upload } = useTus();

  const handleAbort = useCallback(() => {
    if (!upload) {
      return;
    }

    upload.abort();
  }, [upload]);

  return (
    <div>
      <button type="button" onClick={handleAbort}>
        Abort
      </button>
    </div>
  );
};
```

You can also specify the `autoAbort` option to automatically stop uploads when unmounting hooks.

```tsx
import { useTus } from 'use-tus'

const Uploader = () => {
  const { upload, setUpload } = useTus({ autoAbort: true });

  // omitted...
};
```

## Default options of upload
You can specify default options in the `defaultOptions` props of the `TusClientProvider`.

```tsx
import { useTus, TusClientProvider } from 'use-tus'

const defaultOptions = {
  endpoint: 'https://tusd.tusdemo.net/files/',
}

const App = () => (
  <TusClientProvider defaultOptions={defaultOptions}>
    <Uploader />
  </TusClientProvider>
);

const Uploader = () => {
  const { setUpload } = useTus({ autoAtart: true });

  const handleSetUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files.item(0);

      if (!file) {
        return;
      }

      // You no longer need to specify the options associated with upload.
      // If specified, it will override defaultOptions.
      setUpload(file);
    },
    [setUpload]
  );

  return (
    <div>
      <input type="file" onChange={handleSetUpload} />
    </div>
  );
};
```

### Specify upload key
If you specify `cacheKey` as an argument to useTus, you can get the `upload` associated with it. This is useful for cross-page file uploads.

```tsx
const SelectFileComponent = (file: File) => {
  // Create upload accosiated with 'upload-thumbnail' key
  const { setUpload } = useTus({ cacheKey: 'upload-thumbnail' })

  setUpload(file)
}

const UploadFileComponent = () => {
  const { upload } = useTus({ cacheKey: 'upload-thumbnail' })

  upload.start()
}
```


## License
[MIT © kqito](./LICENSE)
