# File Exports

## Image

You can set the image format in the `settings` object:

```js
const settings = {
  frameFormat: "jpg",
  // ...
};
```

Supported image formats are `png`(default), `jpg`/`jpeg` and `webp`. When `hotkeys` is enabled, press `CMD` + `S` (Mac) or `CTRL` + `S` to export an image. You can also set `filename`, `prefix`, `suffix` in the `settings`. If you do not set `filename`, the current date and time string is used.

## Video

You can set the video format in the `settings` object:

```js
const settings = {
  framesFormat: "webm",
  // ...
};
```

You don't have to explicitly set it to `webm` as it is the default format, and currently, it is the only format supported.
