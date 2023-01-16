import type {
  Sketch,
  SketchSettings,
  SketchSettingsInternal,
  SketchLoop,
  SketchRender,
  SketchResize,
  SketchWrapper,
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
import { saveCanvasFrames } from "./export-frames-media-recorder";
import { createStates } from "./states";
import { exportWebM, setupWebMRecord } from "./export-frames-webm-muxer";

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

  // for manual counting scenarios
  let frameCount = 0;

  const loop: SketchLoop = (timestamp: number) => {
    states.timestamp = timestamp - states.pausedDuration;

    // playing
    if (!states.savingFrames) {
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
      // console.log(props.deltaTime); // TEST

      // throttle frame rate
      if (states.frameInterval !== null) {
        if (props.deltaTime < states.frameInterval) {
          window.requestAnimationFrame(loop);
          return;
        }
      }

      computePlayhead({
        settings,
        states,
        props,
      });
      computeFrame({ settings, states, props });
      // console.log(props.frame);
      // update lastTimestamp for deltaTime calculation
      computeLastTimestamp({ states, props });

      // console.log(states.timestamp); // TEST

      render(props);
      window.requestAnimationFrame(loop);

      // console.log(props.deltaTime); // TEST
    } else {
      // recording
      // TODO: what if duration is not set?
      if (!states.captureReady) {
        resetTime({ settings, states, props });
        setupWebMRecord({ canvas, settings });
        states.captureReady = true;
      }

      // time
      // props.time = states.timestamp - states.startTime;
      props.time = frameCount * (1000 / settings.exportFps);
      // deltaTime
      props.deltaTime = 1000 / settings.exportFps;

      computePlayhead({
        settings,
        states,
        props,
      });
      props.frame = frameCount;
      computeLastTimestamp({ states, props });

      render(props);
      window.requestAnimationFrame(loop);

      frameCount += 1;

      // re-calculate totalFrames for exportFps
      // TODO: should be a prop?
      if (
        props.frame >=
        Math.floor((settings.exportFps * settings.duration) / 1000)
      ) {
        states.captureDone = true;
      }

      // save frames
      exportWebM({ canvas, settings, states, props });

      if (states.captureDone) {
        states.captureReady = false;
        states.captureDone = false;
        states.savingFrames = false;

        states.timeResetted = true;
        frameCount = 0;
      }
    }
  };

  if (settings.animate) window.requestAnimationFrame(loop);

  if (settings.hotkeys) {
    addResize();
    addKeydown();
  }
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
