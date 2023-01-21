# Props

You can use any of these props that are passed to your `sketch(props)` function to help with your coding.

The `playhead` prop repeats the range of `0..1` over animation duration. This is useful for creating a seamless loop. For example, `Math.sin(playhead * Math.PI * 2)` will go over one full cycle.

Use `width` and `height` to create a composition proportional to canvas size instead of hard-coding numbers.

### Sketch Modes

|   name    |            type            | description                                                     |
| :-------: | :------------------------: | --------------------------------------------------------------- |
|  `mode`   | `"2d" \| "webgl" \| "ogl"` | Set sketch mode for different types of sketches. default:`"2d"` |
| `context` | `CanvasRenderingContext2D` | available in `2d` mode.                                         |
|   `gl`    |  `WebGLRenderingContext | WebGL2RenderingContext`   | available in `webgl` or `webgl2` modes.                                      |

#### Canvas

|     name     |        type         | description                                                                                       |
| :----------: | :-----------------: | ------------------------------------------------------------------------------------------------- |
|   `canvas`   | `HTMLCanvasElement` | get canvas object reference                                                                       |
|   `width`    |      `number`       | get width in `px`. When `scaleContext` is `true`, `canvas.width` is multiplied by `pixelRatio`.   |
|   `height`   |      `number`       | get height in `px`. When `scaleContext` is `true`, `canvas.height` is multiplied by `pixelRatio`. |
| `pixelRatio` |      `number`       | get current pixel ratio. Displays like Apple Retina can use `2`. default: `1`                     |

### Animation

|     name      |   type   | description                                                                                                       |
| :-----------: | :------: | ----------------------------------------------------------------------------------------------------------------- |
|  `duration`   | `number` | get loop duration in `ms` (ex. `4000` = 4 sec). If `settings.duration` is not set, it will be `Infinity`.         |
| `totalFrames` | `number` | get the number of total frames. If `settings.duration` is not set, it will be `Infinity`.                         |
|    `frame`    | `number` | get current frame count. starts at `0`                                                                            |
|    `time`     | `number` | get current time in `ms`. starts at `0`                                                                           |
|  `deltaTime`  | `number` | get delta time between frame renderes in `ms`                                                                     |
|  `playhead`   | `number` | goes from `0` to `1` over animation duration. If `duration` is not set, it does not update, and will stay at `0`. |

### Function props

|     name      |    type    | description                                                                                      |
| :-----------: | :--------: | ------------------------------------------------------------------------------------------------ |
| `exportFrame` | `function` | Call to save a frame. Useful if you want to attach to some event.                                |
| `togglePlay`  | `function` | Call to toggle play and pause.                                                                   |
|   `update`    | `function` | not yet implemented. takes `settings` object to update settings. ex. `update({ pixelRatio: 2 })` |
