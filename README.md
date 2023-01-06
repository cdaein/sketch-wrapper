# sketch-wrapper

![npm version badge](https://img.shields.io/npm/v/@daeinc/sketch-wrapper)
![npm bundle size badge](https://img.shields.io/bundlephobia/min/@daeinc/sketch-wrapper)

Helpers for creative coding sketches with HTML5 Canvas. It is written from scratch, and heavily inspired by [`canvas-sketch`](https://github.com/mattdesl/canvas-sketch/). Many of the props and settings are compatible.

> ⚠️ This module is in a very early stage of development, and there may be unexpected bugs.

## Install

```sh
npm i @daeinc/sketch-wrapper
```

## Features

- TypeScript: It can work both in JavaScript or TypeScript projects.
- Multiple sketch modes: It supports Canvas 2D context, Webgl context and OGL(through [`ogl-typescript`](https://github.com/nshen/ogl-typescript)) library, or use any other Canvas libraries as long as they support an existing canvas.
- Animation loop: It  has `playhead` prop that repeats `0..1` and makes it easy to create a seamless animation loop.
- Settings: Use `settings` object to reduce boilerplate code in your sketch - set up animation duration, playback frame rate, filename, etc.
- Sketch props: Use props for each mode to help your coding.
- Keyboard shortcuts: Play/pause your sketch and export canvas as image.

## Example Usage

The module supports both JavaScript and TypeScript. 

Check out a separate repository [`sketch-wrapper-examples`](https://github.com/cdaein/sketch-wrapper-examples) for more examples.

```js
import { sketchWrapper } from "@daeinc/sketch-wrapper";

const sketch = ({ canvas, width, height }) => {
  // any setup code
  const bgFill = `#999`;
  const circleFill = `#333`;

  // render loop
  return ({ context: ctx, width, height, playhead }) => {
    ctx.fillStyle = bgFill;
    ctx.fillRect(0, 0, width, height);

    const d = Math.sin(playhead * Math.PI * 2) * 50;

    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width / 4 + d, 0, Math.PI * 2);
    ctx.fillStyle = circleFill;
    ctx.fill();
  };
};

const settings = {
  title: "Sketch Wrapper Demo",
  background: "#333",
  dimensions: [600, 600],
  pixelRatio: window.devicePixelRatio,
  animate: true,
  duration: 4000,
  suffix: "-demo",
};

sketchWrapper(sketch, settings);
```

## How to use

Documentation is updated for `v0.8.11`

### Keyboard Shortcuts

|      Shortcut      | Description                                    |
| :----------------: | ---------------------------------------------- |
| `CMD(or Ctrl) + S` | Export a PNG image.                            |
|     `Spacebar`     | not yet implemented. Pause or resume animation |

### SketchProps

You can use any of these props that are passed to your `sketch(props)` function to help with your coding.

The `playhead` prop repeats the range of `0..1` over animation duration. This is useful for creating a seamless loop. For example, `Math.sin(playhead * Math.PI * 2)` will go over one full cycle.

Use `width` and `height` to create a composition proportional to canvas size instead of hard-coding numbers.

The same `frame` may be repeated if the display refresh rate is higher than the frame rate set.

#### Sketch Modes

|  name  |         type         | description                                                   |
| :----: | :------------------: | ------------------------------------------------------------- |
| `mode` | `2d \| webgl \| ogl` | Set sketch mode for different types of sketches. default:`2d` |

#### Mode-specific Props

##### `2d`

- `context` - returns `CanvasRenderingContext2D` object to.

##### `webgl`

- `gl` - returns `WebGLRenderingContext` object.

##### `ogl`

- `oglContext` - returns `OGLRenderingContext` object
- `oglRenderer` - returns `Renderer` object

#### DOM

|   name    |            type            | description                  |
| :-------: | :------------------------: | ---------------------------- |
| `canvas`  |    `HTMLCanvasElement`     | get canvas object reference  |
| `context` | `CanvasRenderingContext2D` | get context object reference |

#### Canvas

|     name     |   type   | description                                                                                       |
| :----------: | :------: | ------------------------------------------------------------------------------------------------- |
|   `width`    | `number` | get width in `px`. When `scaleContext` is `true`, `canvas.width` is multiplied by `pixelRatio`.   |
|   `height`   | `number` | get height in `px`. When `scaleContext` is `true`, `canvas.height` is multiplied by `pixelRatio`. |
| `pixelRatio` | `number` | get current pixel ratio. Displays like Apple Retina can use `2`. default: `1`                     |

#### Animation

|     name      |   type    | description                                                                                                       |
| :-----------: | :-------: | ----------------------------------------------------------------------------------------------------------------- |
|  `duration`   | `number`  | get loop duration in `ms` (ex. `4000` = 4 sec). If `settings.duration` is not set, it will be `Infinity`.         |
| `totalFrames` | `number`  | get the number of total frames. If `settings.duration` is not set, it will be `Infinity`.                         |
|    `frame`    | `number`  | get current frame count. starts at `0`                                                                            |
|    `time`     | `number`  | get current time in `ms`. starts at `0`                                                                           |
|  `deltaTime`  | `number`  | get delta time between frame renderes in `ms`                                                                     |
|  `playhead`   | `number`  | goes from `0` to `1` over animation duration. If `duration` is not set, it does not update, and will stay at `0`. |
|   `animate`   | `boolean` | not yet implemented.                                                                                              |

#### Function props

|     name      |    type    | description                                                                                      |
| :-----------: | :--------: | ------------------------------------------------------------------------------------------------ |
| `exportFrame` | `function` | Call to save a frame. Useful if you want to attach to some event.                                |
| `togglePlay`  | `function` | Call to toggle play and pause.                                                                   |
|   `update`    | `function` | not yet implemented. takes `settings` object to update settings. ex. `update({ pixelRatio: 2 })` |

### SketchSettings

You can pass any of these settings to `sketchWrapper(sketch, settings)` function. Any undefined settings will use default values.

#### Document

|     name     |   type   | default  | description                                                       |
| :----------: | :------: | :------: | ----------------------------------------------------------------- |
|   `title`    | `string` | `Sketch` | Set HTML document title. It is displayed at top of tab or window. |
| `background` | `string` |  `#333`  | Set HTML background color as CSS color string. ex.`#333`, `gray`  |

#### Canvas

|      name      |          type           |                  default                  | description                                                                                                                                              |
| :------------: | :---------------------: | :---------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
|    `parent`    | `HTMLElement \| string` |                  `body`                   | Set an existing HTML element as canvas parent. It can be either an `HTMLElement` or a selector. ex. `document.querySelector('div#app')`, `div#container` |
|    `canvas`    |   `HTMLCanvasElement`   |                  `null`                   | Use an existing canvas instead of creating a new one. ex. `document.querySelector('canvas#my-canvas')`                                                   |
|  `dimensions`  |   `[number, number]`    | `[window.innerWidth, window.innerHeight]` | Set Canvas width and height in `px`. If not set, use full window size                                                                                    |
|  `pixelRatio`  |        `number`         |                    `1`                    | Set other than `1` for higher quality image on supported displays (ie. Apple Retina display)                                                             |
|   `centered`   |        `boolean`        |                  `true`                   | Center canvas in window.                                                                                                                                 |
| `scaleContext` |        `boolean`        |                  `true`                   | When true, will scale context so `px` values can work for high pixel ratio.                                                                              |
|  `pixelated`   |        `boolean`        |                  `false`                  | not yet implemented.                                                                                                                                     |

#### Animation

|    name     |   type    |  default   | description                                                                         |
| :---------: | :-------: | :--------: | ----------------------------------------------------------------------------------- |
|  `animate`  | `boolean` |   `true`   | Set to `true` for animating. Set to `false` for static sketches.                    |
|  `playFps`  | `number`  |   `null`   | Set frame rate for playback. If not set, will use the maximum display refresh rate. |
| `exportFps` | `number`  |    `60`    | not implemented yet.                                                                |
| `duration`  | `number`  | `Infinity` | Set loop duration in `ms` (ex. `4000` = 4 sec)                                      |

### File Export

|      name      |             type             | default | description                                                                   |
| :------------: | :--------------------------: | :-----: | ----------------------------------------------------------------------------- |
|   `filename`   |           `string`           |  `""`   | Set file name for exported file. if not set, will use current datetime string |
|    `prefix`    |           `string`           |  `""`   | Set prefix to filename                                                        |
|    `suffix`    |           `string`           |  `""`   | Set suffix to filename                                                        |
| `frameFormat`  | `png \| jpeg \| jpg \| webp` |  `png`  | Set image export format yet                                                   |
| `framesFormat` |           `string`           |  `mp4`  | not implemented yet                                                           |
|   `hotkeys`    |          `boolean`           | `true`  | Set to `false` disable keyboard shortcuts such as `Cmd + S` to export image   |

## References

- [`canvas-sketch`](https://github.com/mattdesl/canvas-sketch/)
- [`fragment`](https://github.com/raphaelameaume/fragment)

## License

MIT
