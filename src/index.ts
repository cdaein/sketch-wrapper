import resizeHandler from "./events/resize";
import keydownHandler from "./events/keydown";
import {
  advanceTime,
  computeFrame,
  computeLastTimestamp,
  computePlayhead,
} from "./time";
import { combineSettings } from "./helpers";
import type {
  Sketch,
  SketchSettings,
  SketchSettingsInternal,
  SketchProps,
  SketchStates,
  SketchLoop,
  SketchRender,
  SketchResize,
  SketchWrapper,
  OGLProps,
  BaseProps,
  WebGLProps,
} from "./types";
import { prepareCanvas } from "./canvas";
import { createFunctionProps } from "./function-props";
import { OGLRenderingContext, Renderer } from "ogl-typescript";

// data flow: userSettings + defaultSettings => settings => states (mutable) => props => sketch()
// default settings
// TODO: create settings.ts
const defaultSettings: SketchSettingsInternal = {
  // document
  title: "Sketch",
  background: "#333",
  // canvas
  parent: "body",
  canvas: null,
  dimensions: [window.innerWidth, window.innerHeight],
  pixelRatio: 1,
  centered: true,
  scaleContext: true,
  pixelated: false,
  // animation
  animate: true,
  playFps: null,
  exportFps: 60,
  duration: Infinity,
  totalFrames: Infinity,
  // file
  filename: "",
  prefix: "",
  suffix: "",
  frameFormat: "png",
  framesFormat: "mp4",
  // sketch
  hotkeys: true,
  mode: "2d",
};

export const sketchWrapper: SketchWrapper = (
  sketch: Sketch,
  userSettings: SketchSettings
) => {
  // const isServer = typeof module !== "undefined" && module.exports;
  // console.log(`is running on server? ${isServer ? "✅" : "❌"}`);

  // combine settings; a few may have null or undefined values (ex. canvas)
  const settings = combineSettings({
    base: defaultSettings,
    main: userSettings,
  }) as SketchSettingsInternal;

  // use and update some settings
  // document
  // REVIEW: move inside combineSettings()?
  //         or updateSettings({ ... })
  document.title = settings.title;
  document.body.style.background = settings.background;
  // canvas, context
  // REVIEW: problem may be createCanvas() returns context (2d or webgl), gl (webgl or undefined),
  //         but props doesn't allow it

  const {
    canvas,
    context,
    width,
    height,
    pixelRatio,
    gl,
    oglContext,
    oglRenderer,
  } = prepareCanvas(settings);

  // REVIEW: instead of directly assign to settings[..],
  //         use states if it may update later during sketch lifetime
  //         ex. user provided props.update({ ... })
  settings.canvas = canvas;

  // fps at least 1 or keep at null: will be handled in advanceTime()
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

  // data used internally and may change value during life of sketch
  // REVIEW: i'm probably messing up with naming convention (props, states)
  const states: SketchStates = {
    paused: false,
    playMode: "play",
    savingFrame: false,
    savingFrames: false,
    captureReady: false,
    captureDone: false,
    startTime: 0,
    lastStartTime: 0,
    pausedStartTime: 0,
    pausedDuration: 0,
    timestamp: 0,
    lastTimestamp: 0,
    frameInterval: settings.playFps !== null ? 1000 / settings.playFps : null,
    timeResetted: false,
    temp: 0,
    resized: false, // REVIEW
  };

  // REVIEW: can't move it inside createFunctionProps b/c it needs loop as argument
  //         then, create a callback function that takes loop as argument
  const togglePlay = () => {
    states.paused = !states.paused;
    if (!states.paused) {
      // when resumed: call loop so animation will continue
      // states.timestamp = performance.now() - states.pausedDuration;
      // window.requestAnimationFrame(loop); // not needed?
    } else {
      // when paused
      states.pausedStartTime = states.timestamp;
    }
  };

  // sketch props
  const { exportFrame, update } = createFunctionProps({
    canvas,
    settings,
    states,
  });

  // REVIEW: for now, i settled on having different prop types for each mode.
  //    would have been best to use same Type for everything, but had issues with
  //    union types and users having to assert type on their end.
  //    there is still room to improve with current method.
  const baseProps: BaseProps = {
    // canvas
    canvas,
    width,
    height,
    pixelRatio,
    // animation
    playhead: 0,
    frame: 0,
    time: 0,
    deltaTime: 0,
    duration: settings.duration,
    totalFrames: settings.totalFrames,
    exportFrame,
    togglePlay,
    update,
  };

  const props: SketchProps = {
    ...baseProps,
    context: context as CanvasRenderingContext2D,
  };

  // createCombinedProps(settings.mode)

  let combinedProps: SketchProps | WebGLProps | OGLProps;

  if (settings.mode === "2d") {
    combinedProps = props;
  } else if (settings.mode === "ogl") {
    combinedProps = {
      ...baseProps,
      oglContext: oglContext as OGLRenderingContext,
      oglRenderer: oglRenderer as Renderer,
    } as OGLProps;
  } else {
    combinedProps = {
      ...baseProps,
      gl: gl as WebGLRenderingContext,
    } as WebGLProps;
  }

  //
  // TODO: remove these from dist
  // if (process.env.NODE_ENV === "development") {
  //   console.log("settings", settings); // TEST
  //   console.log("props", props); // TEST
  //   console.log("states", states); // TEST
  // }

  // render 1st frame of 1st page refresh to start w/ playhead=0
  const returned = sketch(combinedProps);

  // REVIEW: had to assign something but don't like it
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
    combinedProps,
    userSettings,
    settings,
    states,
    render,
    resize
  );
  handleResize();

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
    combinedProps.time =
      (states.timestamp - states.startTime) % combinedProps.duration;
    // deltaTime
    combinedProps.deltaTime = states.timestamp - states.lastTimestamp;

    if (states.frameInterval !== null) {
      // throttle frame rate
      if (combinedProps.deltaTime < states.frameInterval) {
        window.requestAnimationFrame(loop);
        return;
      }
    }

    computePlayhead({
      settings,
      props: combinedProps,
    });
    computeFrame({ settings, props: combinedProps });
    // update lastTimestamp for deltaTime calculation
    computeLastTimestamp({ states, props: combinedProps });

    if (settings.animate && !states.paused) {
      render(combinedProps);
      window.requestAnimationFrame(loop);
    }

    // save frame(s)
    if (states.savingFrame) {
      //
    } else if (states.savingFrames) {
      //
    }
  };

  if (settings.animate) window.requestAnimationFrame(loop);

  // keyboard events
  const { add: addKeydown } = keydownHandler(
    canvas,
    combinedProps,
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
