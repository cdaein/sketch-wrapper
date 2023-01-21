# Sketch (Rendering) Modes

Sketch Wrapper supports multiple sketch modes. You can set the mode as part of the `settings` object:

```js
const settings = {
  mode: "webgl",
  // rest of the settings
};
```

Currently, it supports thre different modes - `2d` and `webgl`

## `2d`

This is the default mode, meaning you don't have to explicitly set it if you are creating a `2d` sketch. In this mode, you can write 2d Canvas codes using `context` prop. The `context` is `CanvasRenderingContext2D` object.

```js
const sketch = ({ context }) => {
  return ({ width, height }) => {
    context.clearRect(0, 0, width, height);
    // ...
  };
};
```

In TypeScript:

```ts
const sketch = ({ context }: SketchProps) => {
  return ({ width, height }: SketchProps) => {
    context.clearRect(0, 0, width, height);
    // ...
  };
};
```

You can abbreviate the props like this:

```js
const sketch = ({ context: ctx }) => {
  return ({ width, height }) => {
    ctx.clearRect(0, 0, width, height);
    // ...
  };
};
```

## `webgl`

`webgl` mode will give you `gl` prop, which is `WebGLRenderingContext` object. If you are using external WebGL libraries, you can plug in an existing canvas or context in most cases (ex. Three.js, OGL). Refer to the libraries' documentations.

```js
const sketch = ({ canvas, gl }) => {
  return ({ width, height }) => {
    // ...
  };
};
```

In TypeScript:

```ts
const sketch = ({ canvas, gl }: WebGLProps) => {
  return ({ width, height }: WebGLProps) => {
    // ...
  };
};
```

## `webgl2`

`webgl2` mode will give you `gl` prop, which is `WebGL2RenderingContext` object. If you are using external WebGL libraries, you can plug in an existing canvas or context in most cases (ex. Three.js, OGL). Refer to the libraries' documentations.

```js
const sketch = ({ gl }) => {
  return ({ width, height }) => {
    // ...
  };
};
```

In TypeScript:

```ts
const sketch = ({ gl }: WebGLProps) => {
  return ({ width, height }: WebGLProps) => {
    // ...
  };
};
```
