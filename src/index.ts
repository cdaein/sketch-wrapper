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

  const props = await createProps({
    settings,
    states,
  });
  // canvas is created for props
  const { canvas } = props;

  const returned = sketch(props);

  let render: SketchRender = () => {};
  let resize: SketchResize = () => {};
  if (typeof returned === "function") {
    render = returned;
  } else {
    render = returned.render || render;
    resize = returned.resize || resize;
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

  // run it very first time
  handleResize();

  const loop: SketchLoop = (timestamp: number) => {
    states.timestamp = timestamp - states.pausedDuration;
    if (!states.savingFrames) playLoop({ timestamp, settings, states, props });
    else recordLoop({ canvas, settings, states, props });
  };
  if (settings.animate) {
    // REVIEW: on page load, animation timing is already a few frames off
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
    props: SketchProps | WebGLProps | OGLProps;
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

    render(props);
    window.requestAnimationFrame(loop);
  };

  // for manual counting when recording
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
    props: SketchProps | WebGLProps | OGLProps;
  }) => {
    // TODO: what if duration is not set?
    if (!states.captureReady) {
      resetTime({ settings, states, props });
      setupWebMRecord({ canvas, settings });
      states.captureReady = true;
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

    render(props);
    window.requestAnimationFrame(loop);

    frameCount += 1;

    if (props.frame >= settings.exportTotalFrames) {
      states.captureDone = true;
    }

    // save frames
    exportWebM({ canvas, settings, states, props });

    if (states.captureDone) {
      states.captureReady = false;
      states.captureDone = false;
      states.savingFrames = false;
      states.timeResetted = true; // playLoop should start fresh
      frameCount = 0; // for next recording
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
