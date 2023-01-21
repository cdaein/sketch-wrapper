# sketch-wrapper

![npm version badge](https://img.shields.io/npm/v/@daeinc/sketch-wrapper)
![npm bundle size badge](https://img.shields.io/bundlephobia/min/@daeinc/sketch-wrapper)

Helpers for creative coding sketches with HTML5 Canvas. It is heavily inspired by [`canvas-sketch`](https://github.com/mattdesl/canvas-sketch/). Many of the props and settings are compatible.

> ⚠️ This module is in a very early stage of development, and there may be unexpected bugs.

## Install

```sh
npm i @daeinc/sketch-wrapper
```

## Features

- **TypeScript**: It can work both in JavaScript or TypeScript projects.
- **Multiple sketch modes**: It supports vanilla Canvas 2D API, WebGL context and OGL(through [`ogl-typescript`](https://github.com/nshen/ogl-typescript)) library, or use with other Canvas libraries as long as they support an existing canvas.
- **Animation loop**: It has `playhead` prop that repeats `0..1` and makes it easy to create a seamless animation loop. Other props such as `time`, `deltaTime` are provided as well. You can also adjust frame rate for both playing and recording.
- **Sketch settings**: Use `settings` object to reduce boilerplate code in your sketch - set up animation duration, playback frame rate, filename, etc.
- **Sketch props**: Use props for each mode to help your coding.
- **File exports**: Export canvas as image, animated GIF or WebM video at various frame rates using keyboard shortcuts.

## Motivation

In 2022, I started using [`canvas-sketch`](https://github.com/mattdesl/canvas-sketch) for all my creative coding sketches, and it was wonderful and met most of my needs. However, there were a few features that I wish it had. First was external ESM support. Due to the bundler it was using, I could not import the latest packages that I liked such as [`pts`](https://github.com/williamngan/pts) or [`thi.ng/umbrella`](https://github.com/thi-ng/umbrella). Another was TypeScript. I've only used TS for a few months, but it quickly became a very essential tool in my workflow. So, I thought maybe I'd make my own tool. Sketch-wraper is incomplete and a work-in-progress but it's been a great learning experience personally. If it can find some use in your sketches, that would be great, too.

## How to use

Documentation is updated for `v0.11.0`

- [Basic](./docs/basic.md)
- [Sketch Settings](./docs/settings.md)
- [Sketch Props](./docs/props.md)
- [Sketch (Rendering) Modes](./docs/modes.md)
- and more in the [the documentation](./docs/index.md)

## Example Usage

The module supports both JavaScript and TypeScript.

- 👉 If you are not familiar with NPM, ESM or bundler setup, Check out a quick starter repository, [`sketch-wrapper-starter-js`](https://github.com/cdaein/sketch-wrapper-starter-js).
- 👉 There is also [a starter for TypeScript projects](https://github.com/cdaein/sketch-wrapper-starter-ts).
- 👉 If you want to see more examples on how to use each mode and feature, check out [`sketch-wrapper-examples`](https://github.com/cdaein/sketch-wrapper-examples).

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

## References

- [`canvas-sketch`](https://github.com/mattdesl/canvas-sketch/)
- [`fragment`](https://github.com/raphaelameaume/fragment)

## License

MIT
