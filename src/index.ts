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
  OGLProps,
  P5Props,
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

const sketchWrapper: SketchWrapper = async (
  sketch: Sketch,
  userSettings: SketchSettings
) => {
  // const isServer = typeof module !== "undefined" && module.exports;
  // console.log(`is running on server? ${isServer ? "✅" : "❌"}`);

  // combine settings; a few may have null or undefined values (ex. canvas)
  const settings = createSettings({
    main: userSettings,
  }) as SketchSettingsInternal;

  const states = createStates({ settings });

  let props = await createProps({
    sketch,
    settings,
    states,
  });
  // canvas is created for props
  let { canvas } = props;
  const returned = sketch(props);

  let render: SketchRender = () => {};
  let resize: SketchResize = () => {};
  if (typeof returned === "function") {
    render = returned;
  } else {
    render = returned.render || render;
    resize = returned.resize || resize;
  }

  // TODO: createP5Canvas() cannot be handled by createProps/prepareCanvas
  //       b/c it needs to use props (including p5 instance itself)
  //       or, have it return p5Constructor, not p5 intance?
  if (settings.mode === "p5") {
    console.log(props);
    (props as P5Props).p5.draw = () => {
      console.log("drawwwww");
      render(props);
    };
  }

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
      playLoop({ timestamp, settings, states, props });
    } else {
      recordLoop({ canvas, settings, states, props });
    }
  };

  if (settings.animate) {
    document.addEventListener("DOMContentLoaded", () => {
      window.onload = () => {
        window.requestAnimationFrame(loop);
      };
    });
  }
  if (settings.hotkeys) {
    addResize();
    addKeydown();
  }

  const playLoop = ({
    timestamp,
    settings,
    states,
    props,
  }: {
    timestamp: number;
    settings: SketchSettingsInternal;
    states: SketchStates;
    props: SketchProps | WebGLProps | OGLProps | P5Props;
  }) => {
    // when paused, accumulate pausedDuration
    if (states.paused) {
      states.pausedDuration = timestamp - states.pausedStartTime;
      window.requestAnimationFrame(loop);
      return;
    }

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

    // REVIEW
    if (settings.mode === "p5") {
      (props as P5Props).p5.redraw();
      console.log("redraw");
    } else {
      render(props);
    }
    window.requestAnimationFrame(loop);
  };

  // for manual counting when recording (use only for recording)
  let frameCount = 0;

  const recordLoop = ({
    canvas,
    settings,
    states,
    props,
  }: {
    canvas: HTMLCanvasElement;
    settings: SketchSettingsInternal;
    states: SketchStates;
    props: SketchProps | WebGLProps | OGLProps | P5Props;
  }) => {
    // TODO: what if duration is not set?
    if (!states.captureReady) {
      // reset time only if looping (duration set)
      // REVIEW: whether to resetTime() needs more testing
      if (props.duration) resetTime({ settings, states, props });
      setupWebMRecord({ canvas, settings });
      states.captureReady = true;
      props.recording = true;
    }

    // deltaTime
    props.deltaTime = 1000 / settings.exportFps;
    // time
    props.time = frameCount * props.deltaTime;

    computePlayhead({
      settings,
      props,
    });
    props.frame = frameCount;
    computeLastTimestamp({ states, props });

    frameCount += 1;

    render(props);
    window.requestAnimationFrame(loop);

    // save frames
    exportWebM({ canvas, settings, states, props });

    if (props.frame >= settings.exportTotalFrames - 1) {
      states.captureDone = true;
    }

    if (states.captureDone) {
      endWebMRecord({ canvas, settings });

      states.captureReady = false;
      states.captureDone = false;
      states.savingFrames = false;
      states.timeResetted = true; // playLoop should start fresh

      props.recording = false;

      frameCount = 0; // reset local frameCount for next recording
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
  OGLProps,
  WebGLProps,
  FrameFormat,
  FramesFormat,
} from "./types";
