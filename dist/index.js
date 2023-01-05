import { createCanvas, resizeCanvas } from '@daeinc/canvas';
import { toDomElement } from '@daeinc/dom';
import { Renderer } from 'ogl-typescript';

// src/events/resize.ts
var resize_default = (canvas, props, userSettings, settings, render, resize) => {
  const handleResize = () => {
    if (userSettings.dimensions === void 0 && userSettings.canvas === void 0) {
      if (settings.mode === "2d" || settings.mode === "webgl") {
        ({ width: props.width, height: props.height } = resizeCanvas({
          canvas,
          mode: settings.mode,
          width: window.innerWidth,
          height: window.innerHeight,
          pixelRatio: Math.max(settings.pixelRatio, 1),
          scaleContext: settings.scaleContext
        }));
      }
      resize(props);
      render(props);
    }
    if (userSettings.dimensions !== void 0 && settings.centered) {
      const margin = 50;
      const canvasParent = canvas.parentElement;
      const parentWidth = canvasParent.clientWidth;
      const parentHeight = canvasParent.clientHeight;
      const scale = Math.min(
        1,
        Math.min(
          (parentWidth - margin * 2) / props.width,
          (parentHeight - margin * 2) / props.height
        )
      );
      canvas.style.transform = `scale(${scale})`;
    }
  };
  const add = () => {
    window.addEventListener("resize", handleResize);
  };
  const remove = () => {
    window.removeEventListener("resize", handleResize);
  };
  return { add, remove, handleResize };
};

// src/events/keydown.ts
var keydown_default = (canvas, props, settings, states, loop) => {
  const handleKeydown = (ev) => {
    if (ev.key === " ") {
      ev.preventDefault();
      if (process.env.NODE_ENV === "development")
        console.log("sketch paused or resumed");
      props.togglePlay();
    } else if ((ev.metaKey || ev.ctrlKey) && !ev.shiftKey && ev.key === "s") {
      ev.preventDefault();
      props.exportFrame();
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

// src/time.ts
var advanceTime = ({
  props,
  settings,
  states
}) => {
  const { playFps, exportFps, duration, totalFrames } = settings;
  if (states.startTime === 0) {
    states.startTime = states.timestamp;
    states.lastStartTime = states.startTime;
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
var create2dCanvas = (settings) => {
  let canvas;
  let context;
  let [width, height] = settings.dimensions;
  const pixelRatio = Math.max(settings.pixelRatio, 1);
  const mode = "2d";
  if (settings.canvas === void 0 || settings.canvas === null) {
    ({ canvas, context, width, height } = createCanvas({
      parent: settings.parent,
      mode,
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
      mode,
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
  } else {
    canvas.style.width = 100 + "%";
    canvas.style.height = 100 + "%";
    canvas.style.maxWidth = `${settings.dimensions[0]}px`;
    canvas.style.maxHeight = `${settings.dimensions[1]}px`;
  }
  return { canvas, context, width, height, pixelRatio };
};
var createOglCanvas = (settings) => {
  let canvas;
  let gl;
  let [width, height] = settings.dimensions;
  const pixelRatio = Math.max(settings.pixelRatio, 1);
  ({ canvas, width, height } = createCanvas({
    parent: settings.parent,
    mode: "webgl",
    width,
    height,
    pixelRatio,
    scaleContext: settings.scaleContext
  }));
  const renderer = new Renderer({
    canvas,
    width,
    height,
    dpr: settings.pixelRatio
  });
  gl = renderer.gl;
  if (settings.centered === true) {
    const canvasContainer = canvas.parentElement;
    canvasContainer.style.width = "100vw";
    canvasContainer.style.height = "100vh";
    canvasContainer.style.display = "flex";
    canvasContainer.style.justifyContent = "center";
    canvasContainer.style.alignItems = "center";
    if (settings.scaleContext === false) ;
  } else {
    canvas.style.width = 100 + "%";
    canvas.style.height = 100 + "%";
    canvas.style.maxWidth = `${settings.dimensions[0]}px`;
    canvas.style.maxHeight = `${settings.dimensions[1]}px`;
  }
  return {
    canvas,
    oglContext: gl,
    oglRenderer: renderer,
    width,
    height,
    pixelRatio
  };
};
var createWebglCanvas = (settings) => {
  let canvas;
  let context;
  let gl;
  let [width, height] = settings.dimensions;
  const pixelRatio = Math.max(settings.pixelRatio, 1);
  const mode = "webgl";
  if (settings.canvas === void 0 || settings.canvas === null) {
    ({ canvas, context, gl, width, height } = createCanvas({
      parent: settings.parent,
      mode,
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
    ({ context, gl, width, height } = resizeCanvas({
      canvas,
      mode,
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
  } else {
    canvas.style.width = 100 + "%";
    canvas.style.height = 100 + "%";
    canvas.style.maxWidth = `${settings.dimensions[0]}px`;
    canvas.style.maxHeight = `${settings.dimensions[1]}px`;
  }
  return { canvas, context, gl, width, height, pixelRatio };
};

// src/canvas.ts
var prepareCanvas = (settings) => {
  if (settings.mode === "2d") {
    return create2dCanvas(settings);
  } else if (settings.mode === "webgl") {
    return createWebglCanvas(settings);
  } else if (settings.mode === "ogl") {
    return createOglCanvas(settings);
  }
  return create2dCanvas(settings);
};

// src/file-exports.ts
var saveCanvasFrame = ({
  canvas,
  states,
  settings
}) => {
  let { filename, prefix, suffix, frameFormat: format } = settings;
  if (format === "jpg")
    format = "jpeg";
  const dataURL = canvas.toDataURL(`image/${format}`);
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

// src/function-props.ts
var createFunctionProps = ({
  canvas,
  settings,
  states
}) => {
  return {
    exportFrame: createExportFrameProp({ canvas, settings, states }),
    update: createUpdateProp({ canvas, prevSettings: settings, resizeCanvas: resizeCanvas })
  };
};
var createExportFrameProp = ({
  canvas,
  settings,
  states
}) => {
  return () => {
    states.savingFrame = true;
    states.playMode = "record";
    saveCanvasFrame({
      canvas,
      settings,
      states
    });
  };
};
var createUpdateProp = ({
  canvas,
  prevSettings,
  resizeCanvas: resizeCanvas5
}) => {
  return (settings) => {
    console.log("update() prop is not yet implemented.");
  };
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
    framesFormat: "mp4",
    hotkeys: true,
    mode: "2d"
  };
  const settings = combineSettings({
    base: defaultSettings,
    main: userSettings
  });
  document.title = settings.title;
  document.body.style.background = settings.background;
  let {
    canvas,
    context,
    width,
    height,
    pixelRatio,
    gl,
    oglContext,
    oglRenderer
  } = prepareCanvas(settings);
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
  const states = {
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
    frameInterval: settings.playFps !== null ? 1e3 / settings.playFps : null,
    timeResetted: false
  };
  const togglePlay = () => {
    states.paused = !states.paused;
    if (!states.paused) {
      window.requestAnimationFrame(loop);
    } else {
      states.pausedStartTime = states.timestamp;
    }
  };
  const { exportFrame, update } = createFunctionProps({
    canvas,
    settings,
    states
  });
  const baseProps = {
    canvas,
    width,
    height,
    pixelRatio,
    playhead: 0,
    frame: 0,
    time: 0,
    deltaTime: 0,
    duration: settings.duration,
    totalFrames: settings.totalFrames,
    exportFrame,
    togglePlay,
    update
  };
  const props = {
    ...baseProps,
    context
  };
  const webGLProps = {
    ...baseProps,
    gl
  };
  const oglProps = {
    ...baseProps,
    oglContext,
    oglRenderer
  };
  let combinedProps;
  if (settings.mode === "2d") {
    combinedProps = props;
  } else if (settings.mode === "ogl") {
    combinedProps = oglProps;
  } else {
    combinedProps = webGLProps;
  }
  let returned;
  returned = sketch(combinedProps);
  let render = () => {
  };
  let resize = () => {
  };
  if (typeof returned === "function") {
    render = returned;
  } else {
    render = returned.render || render;
    resize = returned.resize || resize;
  }
  render(combinedProps);
  const loop = (timestamp) => {
    if (!states.paused) {
      states.timestamp = timestamp - states.pausedEndTime;
    } else {
      states.pausedEndTime = timestamp - states.pausedStartTime;
      window.requestAnimationFrame(loop);
      return;
    }
    advanceTime({
      props: combinedProps,
      settings,
      states
    });
    if (states.frameInterval !== null) {
      if (combinedProps.deltaTime < states.frameInterval) {
        window.requestAnimationFrame(loop);
        return;
      }
    }
    states.lastTimestamp = states.timestamp;
    if (combinedProps.playhead >= 1) {
      combinedProps.playhead = 0;
      combinedProps.frame = 0;
      combinedProps.time = 0;
      states.startTime = states.timestamp;
    }
    if (settings.animate && !states.paused) {
      render(combinedProps);
      window.requestAnimationFrame(loop);
    }
    if (states.savingFrames) ;
  };
  window.requestAnimationFrame(loop);
  const { add: addResize, handleResize } = resize_default(
    canvas,
    combinedProps,
    userSettings,
    settings,
    render,
    resize
  );
  handleResize();
  const { add: addKeydown } = keydown_default(
    canvas,
    combinedProps,
    settings,
    states);
  if (settings.hotkeys) {
    addResize();
    addKeydown();
  }
};

export { sketchWrapper };
