import type {
  Sketch,
  SketchSettings,
  SketchSettingsInternal,
  SketchLoop,
  SketchRender,
  SketchResize,
  SketchWrapper,
  SketchStates,
  SketchProps,
  WebGLProps,
} from "./types";
import {
  computeFrame,
  computeLastTimestamp,
  computePlayhead,
  resetTime,
} from "./time";
import { createSettings } from "./settings";
import { createProps } from "./props";
import resizeHandler from "./events/resize";
import keydownHandler from "./events/keydown";
import { createStates } from "./states";
import {
  endWebMRecord,
  exportWebM,
  setupWebMRecord,
} from "./recorders/export-frames-webm-muxer";
import {
  endGifAnimRecord,
  exportGifAnim,
  setupGifAnimRecord,
} from "./recorders/export-frames-gif";

const sketchWrapper: SketchWrapper = async (
  sketch: Sketch,
  userSettings: SketchSettings
) => {
  // combine settings; a few may have null or undefined values (ex. canvas)
  const settings = createSettings({
    main: userSettings,
  }) as SketchSettingsInternal;

  const states = createStates({ settings });

  const props = await createProps({
    settings,
    states,
  });
  // canvas is created for props
  const { canvas } = props;

  let render: SketchRender = () => {};
  let resize: SketchResize = () => {};

  const returned = await sketch(props);

  if (typeof returned === "function") {
    render = returned;
  } else {
    render = returned.render || render;
    resize = returned.resize || resize;
  }

  // add render to props for render-on-demand
  // TODO: it only works in return function props, not init props
  // props.render = render;

  // this will put props.render into sketch, but then, sketch() is called twice.
  // sketch(props);

  // window resize event
  const { add: addResize, handleResize } = resizeHandler(
    canvas,
    props,
    userSettings,
    settings,
    render,
    resize
  );
  // keyboard events
  const { add: addKeydown } = keydownHandler(props, states);

  // animation render loop

  // run it very first time (render, too)
  handleResize();
  // resize runs first frame when dimensions are set
  if (userSettings.dimensions) resize(props);

  // there's time delay between first render in handleResize() and first loop render, resulting in animatiom jump. this compesates for that delay
  let firstLoopRender = true;
  let firstLoopRenderTime = 0;

  const loop: SketchLoop = (timestamp: number) => {
    if (firstLoopRender) {
      firstLoopRenderTime = timestamp;
      firstLoopRender = false;
      window.requestAnimationFrame(loop);
      return;
    }

    states.timestamp = timestamp - firstLoopRenderTime - states.pausedDuration;

    if (!states.savingFrames) {
      playLoop({
        timestamp: timestamp - firstLoopRenderTime,
        settings,
        states,
        props,
      });
    } else {
      recordLoop({ canvas, settings, states, props });
    }
  };
  if (settings.animate) window.requestAnimationFrame(loop);

  if (settings.animate) {
    document.addEventListener("DOMContentLoaded", () => {
      window.onload = () => {
        // REVIEW: rAF here doesn't work in OGL mode
      };
    });
  }
  if (settings.hotkeys) {
    addResize();
    addKeydown();
  }

  const playLoop = async ({
    timestamp,
    settings,
    states,
    props,
  }: {
    timestamp: number;
    settings: SketchSettingsInternal;
    states: SketchStates;
    props: SketchProps | WebGLProps;
  }) => {
    // when paused, accumulate pausedDuration
    if (states.paused) {
      states.pausedDuration = timestamp - states.pausedStartTime;

      // console.log({ timestamp });
      window.requestAnimationFrame(loop);
      return;
    }
    // console.log({ pausedDuration: states.pausedDuration });

    if (states.timeResetted) {
      resetTime({ settings, states, props });
    }

    // time
    // 1. better dt handling
    // props.time = (states.timestamp - states.startTime) % props.duration;
    // 2. full reset each loop. but, dt is one-frame (8 or 16ms) off
    props.time = states.timestamp - states.startTime;

    if (props.time >= props.duration) {
      resetTime({ settings, states, props });
    }
    // deltaTime
    props.deltaTime = states.timestamp - states.lastTimestamp;

    // throttle frame rate
    if (states.frameInterval !== null) {
      if (props.deltaTime < states.frameInterval) {
        window.requestAnimationFrame(loop);
        return;
      }
    }

    computePlayhead({
      settings,
      props,
    });
    computeFrame({ settings, states, props });
    // update lastTimestamp for deltaTime calculation
    computeLastTimestamp({ states, props });

    await render(props);
    window.requestAnimationFrame(loop);
  };

  // for manual counting when recording (use only for recording)
  let _frameCount = 0;

  const recordLoop = async ({
    canvas,
    settings,
    states,
    props,
  }: {
    canvas: HTMLCanvasElement;
    settings: SketchSettingsInternal;
    states: SketchStates;
    props: SketchProps | WebGLProps;
  }) => {
    // TODO: what if duration is not set?
    if (!states.captureReady) {
      // reset time only if looping (duration set)
      // REVIEW: whether to resetTime() needs more testing
      if (props.duration) resetTime({ settings, states, props });

      settings.framesFormat.forEach((format) => {
        if (format !== "webm" && format !== "gif") {
          throw new Error(`${format} export is not supported`);
        }
        if (format === "webm") {
          setupWebMRecord({ canvas, settings });
        } else if (format === "gif") {
          setupGifAnimRecord({ canvas, settings });
        }
      });

      states.captureReady = true;
      props.recording = true;
    }

    // deltaTime
    props.deltaTime = 1000 / settings.exportFps;
    // time
    props.time = _frameCount * props.deltaTime;

    computePlayhead({
      settings,
      props,
    });
    props.frame = _frameCount;
    computeLastTimestamp({ states, props });

    await render(props);
    window.requestAnimationFrame(loop);

    _frameCount += 1;

    // save frames
    settings.framesFormat.forEach((format) => {
      if (format === "webm") {
        exportWebM({ canvas, settings, states, props });
      } else if (format === "gif") {
        {
          let context: any; // REVIEW
          if (settings.mode === "2d") {
            context = (props as SketchProps).context;
          } else if (settings.mode === "webgl" || settings.mode === "webgl2") {
            context = (props as WebGLProps).gl;
          }
          exportGifAnim({ canvas, context, settings, states, props });
        }
      }
    });

    if (props.frame >= settings.exportTotalFrames - 1) {
      states.captureDone = true;
    }

    if (states.captureDone) {
      settings.framesFormat.forEach((format) => {
        if (format === "webm") {
          endWebMRecord({ canvas, settings });
        } else if (format === "gif") {
          endGifAnimRecord({ canvas, settings });
        }
      });

      states.captureReady = false;
      states.captureDone = false;
      states.savingFrames = false;
      states.timeResetted = true; // playLoop should start fresh

      props.recording = false;

      _frameCount = 0; // reset local frameCount for next recording
    }
  };
};

export default sketchWrapper;

export type {
  Sketch,
  SketchRender,
  SketchResize,
  SketchSettings,
  SketchProps,
  WebGLProps,
  FrameFormat,
  FramesFormat,
  GifOptions,
} from "./types";
