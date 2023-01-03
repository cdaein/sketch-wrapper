import resizeHandler from "./events/resize";
import keydownHandler from "./events/keydown";
import { saveCanvasFrame } from "./file-exports";
import { advanceTime } from "./time";
import { combineSettings } from "./helpers";
import {
  Sketch,
  SketchSettings,
  SketchSettingsInternal,
  SketchProps,
  SketchStates,
  SketchLoop,
} from "./types";
import { prepareCanvas } from "./canvas";

export const sketchWrapper = (sketch: Sketch, userSettings: SketchSettings) => {
  // const isServer = typeof module !== "undefined" && module.exports;
  // console.log(`is running on server? ${isServer ? "✅" : "❌"}`);

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
    playFps: 60,
    exportFps: 60,
    duration: Infinity,
    totalFrames: Infinity,
    // file
    filename: "",
    prefix: "",
    suffix: "",
    frameFormat: "png",
    framesFormat: "mp4",
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

  // fps at least 1
  settings.playFps = Math.max(Math.floor(settings.playFps), 1);
  settings.exportFps = Math.max(Math.floor(settings.exportFps), 1);
  // userSettings doesn't have totalFrames, but internally, both will be computed.
  // when both are Infinity, animation will continue to run,
  // time/frame updates, playhead doesn't.
  // REVIEW: use ceil()? will it affect advanceTime()?
  if (settings.duration !== Infinity) {
    settings.totalFrames = Math.floor(
      (settings.duration * settings.playFps) / 1000
    );
  } else if (settings.totalFrames !== Infinity) {
    settings.duration = (settings.totalFrames / settings.playFps) * 1000;
  }

  // TODO: for now, they are the same
  // settings.playFps = settings.exportFps;

  console.log(settings); // TEST

  // sketch props
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
  };

  // data used internally and may change value during life of sketch
  // REVIEW: i'm probably messing up with naming convention (props, states)
  const states: SketchStates = {
    isAnimating: true,
    playMode: "play",
    savingFrame: false,
    savingFrames: false,
    captureReady: false,
    captureDone: false,
    startTime: 0,
    timestamp: 0,
    lastTimestamp: 0,
    frameInterval: 1000 / settings.playFps,
    timeResetted: false,
  };

  // init
  const draw = sketch(props);

  // render 1st frame of 1st page refresh to start w/ playhead=0
  draw(props);

  // animation render loop
  const loop: SketchLoop = () => {
    // 0. first frame draw (outside loop)
    // 1. update time
    // 2. draw
    //   - less than interval: too early, don't draw (request again)
    //   - greater than interval: draw
    // 3. rAF
    // 4. save

    advanceTime({
      props,
      settings,
      states,
    });

    if (props.deltaTime < states.frameInterval) {
      window.requestAnimationFrame(loop);
      return;
    }

    states.lastTimestamp = states.timestamp;

    // REVIEW: this is a hack. canvas-capture records 1 extra frame so had to finish capture early.
    // it seems canva-capture doesn't allow any frame to skip record once it started.
    // so after exporting if i didn't record last frame, whole playback stops,
    // but if i record last frame, i get one extra frame.
    // my hack is finish capture one frame early.
    // TODO: revisit the issue later. maybe move things around.
    // control when states.savingFrames change, when draw() gets called, when savingFrames() receive new data.
    if (props.frame >= props.totalFrames - 1) {
      if (states.savingFrames) {
        states.captureDone = true;
      }
    }

    // REVIEW: check playhead or frame?
    // if (props.playhead >= 1) {
    if (props.frame >= props.totalFrames) {
      // if (states.savingFrames) {
      //   states.captureDone = true;
      // }
      props.playhead = 0;
      props.frame = 0;
      props.time = 0;
      states.startTime = states.timestamp;
    }

    if (settings.animate && states.isAnimating) {
      draw(props);
      window.requestAnimationFrame(loop);
    }

    // save frame(s)
    if (states.savingFrame) {
      saveCanvasFrame({
        canvas,
        settings,
        states,
      });
    }
  };

  window.requestAnimationFrame(loop);

  // window resize event
  // TODO: avoid resizing canvas while exporting
  const { add: addResize } = resizeHandler(
    canvas,
    props,
    userSettings,
    settings,
    pixelRatio,
    settings.scaleContext
  );
  addResize();

  // keyboard events
  // TODO: pressing again will stop exporting
  const { add: addKeydown } = keydownHandler(
    canvas,
    loop,
    props,
    settings,
    states
  );
  addKeydown();
};
