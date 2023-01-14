import type {
  Sketch,
  SketchSettings,
  SketchSettingsInternal,
  SketchLoop,
  SketchRender,
  SketchResize,
  SketchWrapper,
} from "./types";
import { computeFrame, computeLastTimestamp, computePlayhead } from "./time";
import { createSettings } from "./settings";
import { createProps } from "./props";
import resizeHandler from "./events/resize";
import keydownHandler from "./events/keydown";
import { saveCanvasFrames } from "./file-exports";
import { createStates } from "./states";

export const sketchWrapper: SketchWrapper = (
  sketch: Sketch,
  userSettings: SketchSettings
) => {
  // const isServer = typeof module !== "undefined" && module.exports;
  // console.log(`is running on server? ${isServer ? "✅" : "❌"}`);

  // combine settings; a few may have null or undefined values (ex. canvas)
  const settings = createSettings({
    main: userSettings,
  }) as SketchSettingsInternal;

  // use and update some settings
  // document
  document.title = settings.title;
  document.body.style.background = settings.background;

  if (settings.playFps !== null) {
    settings.playFps = Math.max(Math.floor(settings.playFps), 1);
  }
  settings.exportFps = Math.max(Math.floor(settings.exportFps), 1);
  // userSettings doesn't have totalFrames, but internally, both will be computed.
  // when both are Infinity, animation will continue to run,
  // time/frame updates, playhead doesn't.
  // REVIEW: use ceil()? will it affect advanceTime()?
  if (settings.playFps !== null && settings.duration !== Infinity) {
    settings.totalFrames = Math.floor(
      (settings.duration * settings.playFps) / 1000
    );
  }

  const states = createStates({ settings });

  const props = createProps({
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

  // animation render loop
  const loop: SketchLoop = (timestamp: number) => {
    states.timestamp = timestamp - states.pausedDuration;

    // when paused, accumulate pausedDuration
    if (states.paused) {
      states.pausedDuration = timestamp - states.pausedStartTime;
      window.requestAnimationFrame(loop);
      return;
    }

    // time
    props.time = (states.timestamp - states.startTime) % props.duration;

    // reset startTime for recording
    if (states.savingFrames && !states.captureReady) {
      states.startTime = states.timestamp;
      // props.time = 0;
      // props.playhead = 0;
      // props.frame = 0;
      console.log("reset to record");
    }

    // deltaTime
    props.deltaTime = states.savingFrames
      ? 1000 / settings.exportFps
      : states.timestamp - states.lastTimestamp;

    if (states.frameInterval !== null) {
      // throttle frame rate
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
    // update lastTimestamp for deltaTime calculation
    computeLastTimestamp({ states, props });

    if (settings.animate && !states.paused) {
      render(props);
      window.requestAnimationFrame(loop);
    }

    // save frames
    if (states.savingFrames) {
      // saveCanvasFrames({ canvas, settings, states, props: combinedProps });
    }
  };

  if (settings.animate) window.requestAnimationFrame(loop);

  // window resize event
  const { add: addResize, handleResize } = resizeHandler(
    canvas,
    props,
    userSettings,
    settings,
    states,
    render,
    resize
  );
  // run it very first time
  handleResize();

  // keyboard events
  const { add: addKeydown } = keydownHandler(
    canvas,
    props,
    settings,
    states,
    loop
  );

  if (settings.hotkeys) {
    addResize();
    addKeydown();
  }
};

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
