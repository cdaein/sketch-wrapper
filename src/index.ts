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
  SketchReturnObject,
  SketchRender,
  SketchResize,
} from "./types";
import { prepareCanvas } from "./canvas";
import { createFunctionProps } from "./function-props";

export const sketchWrapper = (sketch: Sketch, userSettings: SketchSettings) => {
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
    hotkeys: true,
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
  const { canvas, context, width, height, pixelRatio } =
    prepareCanvas(settings);

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

  const props: SketchProps = {
    // DOM
    canvas,
    context,
    // canvas
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

  if (process.env.NODE_ENV === "development") {
    console.log("settings", settings); // TEST
    console.log("props", props); // TEST
    console.log("states", states); // TEST
  }

  const returned = sketch(props);

  let render: SketchRender;
  let resize: SketchResize;
  if (typeof returned === "function") {
    render = returned;
    resize = () => {}; // REVIEW: had to assign something but don't like it
  } else {
    ({ render, resize } = returned);
  }

  // render 1st frame of 1st page refresh to start w/ playhead=0
  render(props);

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
      props,
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
      render(props);
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
