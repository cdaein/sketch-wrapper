import { createCanvas, resizeCanvas } from '@daeinc/canvas';
import { toDomElement } from '@daeinc/dom';

// src/events/resize.ts
var resize_default = (canvas, props, userSettings, settings, pixelRatio, scaleContext) => {
  const handleResize = () => {
    if (userSettings.dimensions === void 0 && userSettings.canvas === void 0) {
      ({ width: props.width, height: props.height } = resizeCanvas({
        canvas,
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio,
        scaleContext
      }));
    }
  };
  const add = () => {
    window.addEventListener("resize", handleResize);
  };
  const remove = () => {
    window.removeEventListener("resize", handleResize);
  };
  return { add, remove };
};

// src/events/keydown.ts
var keydown_default = (canvas, loop, props, settings, states) => {
  const handleKeydown = (ev) => {
    if (ev.key === " ") {
      ev.preventDefault();
      console.log("sketch paused or resumed");
      states.isAnimating = !states.isAnimating;
      if (states.isAnimating)
        window.requestAnimationFrame(loop);
    } else if ((ev.metaKey || ev.ctrlKey) && !ev.shiftKey && ev.key === "s") {
      ev.preventDefault();
      states.savingFrame = true;
      states.playMode = "record";
    } else if ((ev.metaKey || ev.ctrlKey) && ev.shiftKey && ev.key === "s") {
      ev.preventDefault();
      if (!states.savingFrames) {
        states.savingFrames = true;
      } else {
        states.captureDone = true;
      }
    }
  };
  const add = () => {
    window.addEventListener("keydown", handleKeydown);
  };
  const remove = () => {
    window.removeEventListener("keydown", handleKeydown);
  };
  return { add, remove };
};

// src/file-exports.ts
var saveCanvasFrame = ({
  canvas,
  states,
  settings
}) => {
  const { filename, prefix, suffix, frameFormat: format } = settings;
  const dataURL = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = `${formatFilename({
    filename,
    prefix,
    suffix
  })}.${format}`;
  link.href = dataURL;
  link.click();
  states.savingFrame = false;
  states.playMode = "play";
};
var formatFilename = ({
  filename,
  prefix = "",
  suffix = ""
}) => {
  return filename === void 0 || filename === "" ? `${prefix}${formatDatetime(new Date())}${suffix}` : filename;
};
var formatDatetime = (date) => {
  const offset = date.getTimezoneOffset();
  date.setMinutes(date.getMinutes() - offset);
  const isoString = date.toISOString();
  const [full, yyyy, mo, dd, hh, mm, ss] = isoString.match(
    /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/
  );
  const formatted = `${yyyy}.${mo}.${dd}-${hh}.${mm}.${ss}`;
  return formatted;
};

// src/time.ts
var advanceTime = ({
  props,
  settings,
  states
}) => {
  const { playFps, exportFps, duration, totalFrames } = settings;
  states.savingFrames ? exportFps : playFps;
  states.timestamp = performance.now();
  if (states.startTime === 0) {
    states.startTime = states.timestamp;
    states.lastTimestamp = states.timestamp;
  }
  props.deltaTime = states.timestamp - states.lastTimestamp;
  props.time = states.timestamp - states.startTime;
  props.playhead = duration !== Infinity ? props.time / duration : 0;
  computeFrame({ settings, props });
};
var computeFrame = ({
  settings,
  props
}) => {
  const { duration, playFps, totalFrames } = settings;
  if (duration !== Infinity) {
    if (playFps !== null) {
      props.frame = Math.floor(props.playhead * totalFrames);
    } else {
      props.frame += 1;
    }
  } else {
    if (playFps !== null) {
      props.frame = Math.floor(props.time * playFps / 1e3);
    } else {
      props.frame += 1;
    }
  }
};

// src/helpers.ts
var combineSettings = ({
  base,
  main
}) => {
  const combined = Object.assign({}, base, main);
  for (const [key, value] of Object.entries(combined)) {
    if (value === void 0) {
      combined[key] = base[key];
    }
  }
  if (Object.values(combined).some((value) => value === void 0)) {
    throw new Error("settings object cannot have undefined values");
  }
  return combined;
};
var prepareCanvas = (settings) => {
  let canvas;
  let context;
  let [width, height] = settings.dimensions;
  const pixelRatio = Math.max(settings.pixelRatio, 1);
  if (settings.canvas === void 0 || settings.canvas === null) {
    ({ canvas, context, width, height } = createCanvas({
      parent: settings.parent,
      width,
      height,
      pixelRatio,
      scaleContext: settings.scaleContext
    }));
  } else {
    if (settings.canvas.nodeName.toLowerCase() !== "canvas") {
      throw new Error("provided canvas must be an HTMLCanvasElement");
    }
    canvas = settings.canvas;
    if (settings.parent) {
      toDomElement(settings.parent).appendChild(canvas);
    }
    ({ context, width, height } = resizeCanvas({
      canvas,
      width: settings.dimensions ? settings.dimensions[0] : canvas.width,
      height: settings.dimensions ? settings.dimensions[1] : canvas.height,
      pixelRatio,
      scaleContext: settings.scaleContext
    }));
  }
  if (settings.centered === true) {
    const canvasContainer = canvas.parentElement;
    canvasContainer.style.width = "100vw";
    canvasContainer.style.height = "100vh";
    canvasContainer.style.display = "flex";
    canvasContainer.style.justifyContent = "center";
    canvasContainer.style.alignItems = "center";
    if (settings.scaleContext === false) ;
  }
  return { canvas, context, width, height, pixelRatio };
};

// src/index.ts
var sketchWrapper = (sketch, userSettings) => {
  const defaultSettings = {
    title: "Sketch",
    background: "#333",
    parent: "body",
    canvas: null,
    dimensions: [window.innerWidth, window.innerHeight],
    pixelRatio: 1,
    centered: true,
    scaleContext: true,
    pixelated: false,
    animate: true,
    playFps: null,
    exportFps: 60,
    duration: Infinity,
    totalFrames: Infinity,
    filename: "",
    prefix: "",
    suffix: "",
    frameFormat: "png",
    framesFormat: "mp4"
  };
  const settings = combineSettings({
    base: defaultSettings,
    main: userSettings
  });
  document.title = settings.title;
  document.body.style.background = settings.background;
  const { canvas, context, width, height, pixelRatio } = prepareCanvas(settings);
  settings.canvas = canvas;
  if (settings.playFps !== null) {
    settings.playFps = Math.max(Math.floor(settings.playFps), 1);
  }
  settings.exportFps = Math.max(Math.floor(settings.exportFps), 1);
  if (settings.playFps !== null && settings.duration !== Infinity) {
    settings.totalFrames = Math.floor(
      settings.duration * settings.playFps / 1e3
    );
  }
  const props = {
    canvas,
    context,
    width,
    height,
    pixelRatio,
    playhead: 0,
    frame: 0,
    time: 0,
    deltaTime: 0,
    duration: settings.duration,
    totalFrames: settings.totalFrames
  };
  const states = {
    isAnimating: true,
    playMode: "play",
    savingFrame: false,
    savingFrames: false,
    captureReady: false,
    captureDone: false,
    startTime: 0,
    timestamp: 0,
    lastTimestamp: 0,
    frameInterval: settings.playFps !== null ? 1e3 / settings.playFps : null,
    timeResetted: false
  };
  const draw = sketch(props);
  draw(props);
  const loop = () => {
    advanceTime({
      props,
      settings,
      states
    });
    if (states.frameInterval !== null) {
      if (props.deltaTime < states.frameInterval) {
        window.requestAnimationFrame(loop);
        return;
      }
    }
    states.lastTimestamp = states.timestamp;
    if (props.playhead >= 1) {
      props.playhead = 0;
      props.frame = 0;
      props.time = 0;
      states.startTime = states.timestamp;
    }
    if (settings.animate && states.isAnimating) {
      draw(props);
      window.requestAnimationFrame(loop);
    }
    if (states.savingFrame) {
      saveCanvasFrame({
        canvas,
        settings,
        states
      });
    }
  };
  window.requestAnimationFrame(loop);
  const { add: addResize } = resize_default(
    canvas,
    props,
    userSettings,
    settings,
    pixelRatio,
    settings.scaleContext
  );
  addResize();
  const { add: addKeydown } = keydown_default(
    canvas,
    loop,
    props,
    settings,
    states
  );
  addKeydown();
};

export { sketchWrapper };