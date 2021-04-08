<h3 align="center">
  use-tus
</h3>

<p align="center">
Reusable React Hooks for <a href="https://github.com/tus/tus-js-client">tus-js-client</a>.
</p>

<p align="center">
  <a href="https://github.com/kqito/use-tus/actions/workflows/test.yml"><img src="https://github.com/kqito/use-tus/workflows/Test/badge.svg" alt="Build status"></a>
  <a href="https://badge.fury.io/js/use-tus"><img src="https://badge.fury.io/js/use-tus.svg" alt="Npm version"></a>
  <a href="https://github.com/kqito/use-tus/blob/main/LICENSE"><img src="https://img.shields.io/github/license/kqito/use-tus" alt="License"></a>
</p>

## Features
- Generating tus with react hooks.
- Reuse the `Upload` instances by context.
- One dependency(tus-js-client).
- TypeScript support.


## Installation
You can install the package from npm.
```
npm install use-tus
```

or
```
yarn add use-tus
```


## Usage
### `useTus` hooks

```js
const { upload, setUpload, isSuccess, error, remove } = useTus(uploadKey);
```

`useTus` is a hooks to get or create an `Upload` instance of tus.

### Arguments
- `uploadKey` (type: `string | undefined`)
  - Specify the key associated with the `Upload` instance. if it's undefined, a random string will be specified.


### Returns
- `upload` (type: `tus.Upload | undefined`)
  - The value of the `Upload` instance associated with the uploadKey in the TusClientProvider. If not present, undefined.

- `setUpload` (type: `(file: tus.Upload['file'], options: tus.Upload['options']) => void`)
  - Function to create an `Upload` instance and store it in TusClientProvider.

- `isSuccess` (type: `boolean`)
  - Whether the upload was successful or not.

- `error` (type: `Error | undefined`)
  - Error when upload fails.

- `remove` (type: `() => void`)
  - Function to delete the `Upload` Instance associated with uploadKey.

### `TusClientProvider`

```js
() => (
  <TusClientProvider>
    {someYourComponents}
  </TusClientProvider>
)
```

`TusClientProvider` is the provider that stores the `Upload` instance with `useTus` hooks.

### Props
- `canStoreURLs` (type: `boolean | undefined`)
  - A boolean indicating whether the current environment allows storing URLs enabling the corresponding upload to be resumed. [detail](https://github.com/tus/tus-js-client/blob/master/docs/api.md#tuscanstoreurls)

- `defaultOptions` (type: `tus.DefaltOptions | undefined`)
  - An object containing the default options used when creating a new upload. [detail](https://github.com/tus/tus-js-client/blob/master/docs/api.md#tusdefaultoptions)


## Example
We can use `useTus` as following.

```tsx
import { useTus, TusClientProvider } from 'use-tus'

const App = () => (
  <TusClientProvider>
    <Uploader />
  </TusClientProvider>
);

const Uploader = () => {
  const { upload, setUpload, isSuccess, error } = useTus('upload-key');

  const handleSetUpload = useCallback(
    (event) => {
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

    upload.start();
  }, [upload]);

  return (
    <div>
      <input type="file" onChange={handleSetUpload} />
      {upload && (
        <button type="button" onClick={handleStart}>
          Upload
        </button>
      )}
    </div>
  );
};
```



## License
[MIT © kqito](./LICENSE)
