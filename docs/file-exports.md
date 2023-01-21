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

## Video (Moving Images)

You can set the file format in the `settings` object:

```js
const settings = {
  framesFormat: "webm",
  // ...
};
```

You can also set it to `"gif"` to export an animated GIF file. The default value for `framesFormat` is `"webm"`.
