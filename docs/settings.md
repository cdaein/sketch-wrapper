# SketchSettings

You can pass any of these settings to `sketchWrapper(sketch, settings)` function. Any undefined settings will use default values.

### Document

|     name     |   type   |  default   | description                                                       |
| :----------: | :------: | :--------: | ----------------------------------------------------------------- |
|   `title`    | `string` | `"Sketch"` | Set HTML document title. It is displayed at top of tab or window. |
| `background` | `string` |  `"#333"`  | Set HTML background color as CSS color string. ex.`#333`, `gray`  |

### Canvas

|      name      |             type              |                  default                  | description                                                                                                                                              |
| :------------: | :---------------------------: | :---------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|     `mode`     | `"2d" \| "webgl" \| "webgl2"` |                  `"2d"`                   | See [modes](./modes.md) for details.                                                                                                                     |
|    `parent`    |    `HTMLElement \| string`    |                  `body`                   | Set an existing HTML element as canvas parent. It can be either an `HTMLElement` or a selector. ex. `document.querySelector('div#app')`, `div#container` |
|    `canvas`    |      `HTMLCanvasElement`      |                  `null`                   | Use an existing canvas instead of creating a new one. ex. `document.querySelector('canvas#my-canvas')`                                                   |
|  `dimensions`  |      `[number, number]`       | `[window.innerWidth, window.innerHeight]` | Set Canvas width and height in `px`. If not set, use full window size                                                                                    |
|  `pixelRatio`  |           `number`            |                    `1`                    | Set other than `1` for higher quality image on supported displays (ie. Apple Retina display)                                                             |
|   `centered`   |           `boolean`           |                  `true`                   | Center canvas in window.                                                                                                                                 |
| `scaleContext` |           `boolean`           |                  `true`                   | When true, will scale context so `px` values can work for high pixel ratio.                                                                              |
|  `pixelated`   |           `boolean`           |                  `false`                  | not yet implemented.                                                                                                                                     |

### Animation

|    name     |   type    |  default   | description                                                                         |
| :---------: | :-------: | :--------: | ----------------------------------------------------------------------------------- |
|  `animate`  | `boolean` |   `true`   | Set to `true` for animating. Set to `false` for static sketches.                    |
|  `playFps`  | `number`  |   `null`   | Set frame rate for playback. If not set, will use the current display refresh rate. |
| `exportFps` | `number`  |    `60`    | Set frame rate for WebM video export. Supports up to 60fps.                         |
| `duration`  | `number`  | `Infinity` | Set loop duration in `ms` (ex. `4000` = 4 sec)                                      |

### File Export

|      name      |                 type                 | default  | description                                                                                                           |
| :------------: | :----------------------------------: | :------: | --------------------------------------------------------------------------------------------------------------------- |
|   `filename`   |               `string`               |   `""`   | Set file name for exported file. if not set, will use current datetime string                                         |
|    `prefix`    |               `string`               |   `""`   | Set prefix to filename                                                                                                |
|    `suffix`    |               `string`               |   `""`   | Set suffix to filename                                                                                                |
| `frameFormat`  | `"png" \| "jpeg" \| "jpg" \| "webp"` | `"png"`  | Set image export format. To export multiple formats at the same time, use array like `["png", "webp"]`.               |
| `framesFormat` |          `"webm" \| "gif"`           | `"webm"` | Set moving image export format. To export multiple frames formats at the same time, use array like `["webm", "gif"]`. |
|   `hotkeys`    |              `boolean`               |  `true`  | Set to `false` to disable keyboard shortcuts such as `Cmd + S` to export image                                        |
