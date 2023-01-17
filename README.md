# sketch-wrapper

![npm version badge](https://img.shields.io/npm/v/@daeinc/sketch-wrapper)
![npm bundle size badge](https://img.shields.io/bundlephobia/min/@daeinc/sketch-wrapper)

Helpers for creative coding sketches with HTML5 Canvas. It is written from scratch, and heavily inspired by [`canvas-sketch`](https://github.com/mattdesl/canvas-sketch/). Many of the props and settings are compatible.

Documentation is updated for `v0.10.3`

> ⚠️ This module is in a very early stage of development, and there may be unexpected bugs.

## Install

```sh
npm i @daeinc/sketch-wrapper
```

## Features

- TypeScript: It can work both in JavaScript or TypeScript projects.
- Multiple sketch modes: It supports vanilla Canvas 2D API, Webgl context and OGL(through [`ogl-typescript`](https://github.com/nshen/ogl-typescript)) library, or use any other Canvas libraries as long as they support an existing canvas.
- Animation loop: It has `playhead` prop that repeats `0..1` and makes it easy to create a seamless animation loop. Other props such as `time`, `deltaTime` are provided as well.
- Settings: Use `settings` object to reduce boilerplate code in your sketch - set up animation duration, playback frame rate, filename, etc.
- Sketch props: Use props for each mode to help your coding.
- Keyboard shortcuts: Play/pause your sketch and export canvas as image or WebM video at various frame rates (using [`webm-muxer`](https://github.com/Vanilagy/webm-muxer/) package).

## Motivation

In 2022, I started using [`canvas-sketch`](https://github.com/mattdesl/canvas-sketch) for all my creative coding sketches, and it was wonderful and met most of my needs. However, there were a few features that I wish it had. First was external ESM support. Due to the bundler it was using, I could not import latest packages that I liked such as [`pts`](https://github.com/williamngan/pts) or [`thi.ng/umbrella`](https://github.com/thi-ng/umbrella). Another was TypeScript. I've only used TS for a few months, but it quickly became a very essential tool in my workflow. So, I thought maybe I'd make my own tool. Sketch-wraper is incomplete and work-in-progress but it's been a great learning experience personally. If it can find some use in your sketches, that would be great, too.

## Example Usage

The module supports both JavaScript and TypeScript.

Check out a separate repository [`sketch-wrapper-examples`](https://github.com/cdaein/sketch-wrapper-examples) for more examples.

```js
import sketchWrapper from "@daeinc/sketch-wrapper";

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

See [the documentation](./docs/index.md)

- [Basic](./docs/basic.md)
- [Sketch Settings](./docs/settings.md)
- [Sketch Props](./docs/props.md)

> ✋ Note: Sketch Wrapper uses dynamic import of optional dependencies (ex. `ogl-typescript`) to reduce the package size. Your bundler may complain that it cannot find these dependencies. To get around this, you will need to exclude them at bundle time. [Vitejs](https://vitejs.dev/) is recommended to use with Sketch Wrapper and you can use [`optimizeDeps.exclude`](https://vitejs.dev/guide/dep-pre-bundling.html) to configure like below:

```js
// vite.config.js
export default defineConfig({
  optimizeDeps: {
    exclude: ["ogl-typescript"],
  },
});
```

### Keyboard Shortcuts

|          Shortcut          | Description                       |
| :------------------------: | --------------------------------- |
|     `CMD(or Ctrl) + S`     | Export a PNG image.               |
| `CMD(or Ctrl) + Shift + S` | Export a video (WebM by default). |
|         `Spacebar`         | Pause or resume animation         |

## References

- [`canvas-sketch`](https://github.com/mattdesl/canvas-sketch/)
- [`fragment`](https://github.com/raphaelameaume/fragment)

## License

MIT
