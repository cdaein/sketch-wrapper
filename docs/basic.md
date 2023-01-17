# Basic

To use Sketch Wrapper, first import the module.

```js
import sketchWrapper from '@daeinc/sketch-wrapper`
```

`sketchWrapper` function takes two arguments, `sketch` and `settings` and creates and sets up an HTML Canvas for you:

```js
sketchWrapper(sketch, settings)
```

`sketch` is a function you will provide that contains your code. `settings` object is used to set up your sketch such as dimensions, frame rate, pixel ratio, etc. We will take a look at how to create each.

Here is how a `sketch` function is structured:

```js
const sketch = () => {
  // init code (runs once when initializing your sketch)
  return () => {
    // animation code (continues to run every frame)
    console.log('hello')
  }
}
```

By itself, it is not very useful, but we can use many props that are passed into the `sketch` function such as `context`, `playhead`, `width`, `height`, etc.

Let's look at a very basic 2d canvas sketch code:

```js
const sketch = () => {
  return ({ context, width, height, playhead }) => {
    // gray background
    context.fillStyle = `gray`
    context.fillRect(0, 0, width, height)

    // playhead goes from 0 to 1
    // the variable dr will go from 0 to 1 and be used to create a seamless loop
    const dr = Math.sin(playhead * Math.PI * 2) * 0.5 + 0.5

    // circle at center
    context.arc(width/2, height/2, width/2 + dr * width/2, 0, Math.PI * 2)
    context.fillStyle = `#fff`
    context.fill()
  }
}
```

We haven't created `settings` object yet, so the code above will not run. Let's make the `settings` object:

```js
const settings = {
  // creates a canvas of 600px by 600px
  dimensions: [600, 600],
  // this will be an animated sketch
  animate: true,
  // duration in milliseconds (4 seconds)
  duration: 4000, 
  // sets playback frame rate
  playFps: 24,
  // sets video export frame rate (both frame rates may or may not be the same)
  exportFps: 60,
}
```

Then, pass them to `sketchWrapper` function at the end:

```js
sketchWrapper(sketch, settings)
```

Now, you will see the white circle animated at the center of the canvas and it will be a seamless animation loop. There are many more props and settings to help your creative coding, so check out the rest of the documentation. Also, see [`sketch-wrapper-examples`](https://github.com/cdaein/sketch-wrapper-examples) repository for more examples.

### For TypeScript users

You may have to also import a few types and use type assertions. 

```ts
import sketchWrapper from '@daeinc/sketch-wrapper'
import type { Sketch, SketchProps } from '@daeinc/sketch-wrapper'

const sketch = () => {
  // use SketchProps type for 2d canvas sketch
  return ({ context, width, height, playhead }: SketchProps) => {
    // ...
  }
}

const settings = {
  // ...
}

// use type assertion
sketchWrapper(sketch as Sketch, settings)
```

