import resizeHandler from "./events/resize";
import keydownHandler from "./events/keydown";
import { advanceTime } from "./time";
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
  OglProps,
  BaseProps,
  WebGLProps,
  SketchReturnObject,
} from "./types";
import { prepareCanvas } from "./canvas";
import { createFunctionProps } from "./function-props";
import { OGLRenderingContext, Renderer } from "ogl-typescript";

export const sketchWrapper: SketchWrapper = (
  sketch: Sketch,
  userSettings: SketchSettings
) => {
  // const isServer = typeof module !== "undefined" && module.exports;
  // console.log(`is running on server? ${isServer ? "✅" : "❌"}`);

  // data flow: userSettings + defaultSettings => settings => states (mutable) => props => sketch()
  // default settings
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

  // combine settings. no undefined.
  // may have null values (ex. canvas)
  const settings = combineSettings({
    base: defaultSettings,
    main: userSettings,
  }) as SketchSettingsInternal;

  // use and update some settings
  // document
  document.title = settings.title;
  document.body.style.background = settings.background;
  // canvas, context
  // REVIEW: problem may be createCanvas() returns context (2d or webgl), gl (webgl or undefined),
  //         but props doesn't allow it

  let {
    canvas,
    context,
    width,
    height,
    pixelRatio,
    gl,
    oglContext,
    oglRenderer,
  } = prepareCanvas(settings);

  // TEST
  // function isOgl(
  //   gl: WebGLRenderingContext | OGLRenderingContext | undefined
  // ): gl is OGLRenderingContext {
  //   return (gl as OGLRenderingContext).renderer !== undefined;
  // }

  // if (oglContext !== undefined) {
  //   gl = oglContext as NonNullable<OGLRenderingContext>;
  // }

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
  // else if (settings.playFps !== null && settings.totalFrames !== Infinity) {
  //   settings.duration = (settings.totalFrames / settings.playFps) * 1000;
  // }

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
    pausedEndTime: 0,
    timestamp: 0,
    lastTimestamp: 0,
    frameInterval: settings.playFps !== null ? 1000 / settings.playFps : null,
    timeResetted: false,
  };

  // sketch props
  const { exportFrame, update } = createFunctionProps({
    canvas,
    settings,
    states,
  });

  // REVIEW: can't move it inside createFunctionProps b/c it needs loop as argument
  const togglePlay = () => {
    states.paused = !states.paused;
    if (!states.paused) {
      // when resumed: call loop so animation will continue
      window.requestAnimationFrame(loop);
    } else {
      // when paused
      states.pausedStartTime = states.timestamp;
    }
  };

  const baseProps = {
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
    // REVIEW is this good to assert type like this when it very well can be undefined?
    //        at least, there will be a warning when trying access wrong methods on context
    //        i think best way is not to export props at all if undefined.
    //        but optional prop is causing undefined warning at sketch
    //        also context should always be 2d context, gl = webgl
    context: context as CanvasRenderingContext2D,
  };

  const webGLProps: WebGLProps = {
    ...baseProps,
    gl: gl as WebGLRenderingContext,
  };

  const oglProps: OglProps = {
    ...baseProps,
    oglContext: oglContext as OGLRenderingContext,
    oglRenderer: oglRenderer as Renderer,
  };

  // TODO: remove these from dist
  // if (process.env.NODE_ENV === "development") {
  //   console.log("settings", settings); // TEST
  //   console.log("props", props); // TEST
  //   console.log("states", states); // TEST
  // }

  let returned: SketchRender | SketchReturnObject;
  // render 1st frame of 1st page refresh to start w/ playhead=0
  if (settings.mode === "2d") {
    returned = sketch(props);
  } else if (settings.mode === "ogl") {
    returned = sketch(oglProps);
  } else {
    returned = sketch(webGLProps);
  }

  // REVIEW: had to assign something but don't like it
  let render: SketchRender = () => {};
  let resize: SketchResize = () => {};
  if (typeof returned === "function") {
    render = returned;
  } else {
    render = returned.render || render;
    resize = returned.resize || resize;
  }

  // render 1st frame of 1st page refresh to start w/ playhead=0
  if (settings.mode === "2d") {
    render(props);
  } else if (settings.mode === "ogl") {
    render(oglProps);
  } else if (settings.mode === "webgl") {
    render(webGLProps);
  }

  // animation render loop
  const loop: SketchLoop = (timestamp: number) => {
    // 0. first frame draw (outside loop)
    // 1. update time
    // 2. draw
    //   - less than interval: too early, don't draw (request again)
    //   - greater than interval: draw
    // 3. rAF
    // 4. save

    if (!states.paused) {
      // store performance.now() once and re-use within same loop call
      states.timestamp = timestamp - states.pausedEndTime;
    } else {
      states.pausedEndTime = timestamp - states.pausedStartTime;
      window.requestAnimationFrame(loop);
      return;
    }

    // const newSettings = { ...settings, ...update(settings as SketchSettings) };

    advanceTime({
      props: baseProps,
      settings,
      states,
    });

    if (states.frameInterval !== null) {
      if (props.deltaTime < states.frameInterval) {
        window.requestAnimationFrame(loop);
        return;
      }
    }

    // if (process.env.NODE_ENV === "development") {
    //   console.log({
    //     timestamp,
    //     "st.timestamp": states.timestamp,
    //     "st.pausedStartTime": states.pausedStartTime,
    //     "st.pausedEndTime": states.pausedEndTime,
    //   });
    // }

    states.lastTimestamp = states.timestamp;

    if (props.playhead >= 1) {
      props.playhead = 0;
      props.frame = 0;
      props.time = 0;
      states.startTime = states.timestamp;
    }

    // new settings from update() prop

    if (settings.animate && !states.paused) {
      if (settings.mode === "2d") {
        render({ ...baseProps, ...props });
      } else if (settings.mode === "ogl") {
        render({ ...baseProps, ...oglProps });
      } else if (settings.mode === "webgl") {
        render({ ...baseProps, ...webGLProps });
      }
      window.requestAnimationFrame(loop);
    }

    // save frame(s)
    if (states.savingFrames) {
      //
    }
  };

  window.requestAnimationFrame(loop);

  // event handlers
  // window resize event
  const { add: addResize, handleResize } = resizeHandler(
    canvas,
    props,
    userSettings,
    settings,
    render,
    resize
  );
  handleResize(); // run once when page is first loaded

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
  FrameFormat,
  FramesFormat,
} from "./types";
