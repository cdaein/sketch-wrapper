import { createCanvas, resizeCanvas } from '@daeinc/canvas';
import { toHTMLElement } from '@daeinc/dom';
import WebMMuxer from 'webm-muxer';

// src/time.ts
var computePlayhead = ({
  settings,
  props
}) => {
  const { duration } = settings;
  props.playhead = duration !== Infinity ? props.time / duration : 0;
};
var computeFrame = ({
  settings,
  states,
  props
}) => {
  let { duration, playFps, exportFps, totalFrames } = settings;
  const fps = states.savingFrames ? exportFps : playFps;
  if (states.savingFrames) {
    totalFrames = Math.floor(exportFps * duration / 1e3);
  }
  if (duration !== Infinity) {
    if (fps !== null) {
      props.frame = Math.floor(props.playhead * totalFrames);
    } else {
      props.frame += 1;
    }
  } else {
    if (fps !== null) {
      props.frame = Math.floor(props.time * fps / 1e3);
    } else {
      props.frame += 1;
    }
  }
};
var computeLastTimestamp = ({
  states,
  props
}) => {
  states.lastTimestamp = states.frameInterval ? states.timestamp - props.deltaTime % states.frameInterval : states.timestamp;
};
var resetTime = ({
  settings,
  states,
  props
}) => {
  const { playFps, exportFps } = settings;
  const fps = states.savingFrames ? exportFps : playFps;
  states.startTime = states.timestamp;
  props.time = 0;
  props.playhead = 0;
  props.frame = playFps ? 0 : -1;
  states.lastTimestamp = states.startTime - (fps ? 1e3 / fps : 0);
  states.timeResetted = false;
};

// src/settings.ts
var createSettings = ({
  main
}) => {
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
    exportTotalFrames: Infinity,
    filename: "",
    prefix: "",
    suffix: "",
    frameFormat: "png",
    framesFormat: "webm",
    hotkeys: true,
    mode: "2d"
  };
  const combined = Object.assign({}, defaultSettings, main);
  for (const [key, value] of Object.entries(combined)) {
    if (value === void 0) {
      combined[key] = defaultSettings[key];
    }
  }
  if (Object.values(combined).some((value) => value === void 0)) {
    throw new Error("settings object cannot have undefined values");
  }
  document.title = combined.title;
  document.body.style.background = combined.background;
  if (combined.playFps !== null) {
    combined.playFps = Math.max(Math.floor(combined.playFps), 1);
  }
  combined.exportFps = Math.max(Math.floor(combined.exportFps), 1);
  if (combined.playFps !== null && combined.duration !== Infinity) {
    combined.totalFrames = Math.floor(
      combined.duration * combined.playFps / 1e3
    );
  }
  if (combined.exportFps !== null && combined.duration !== Infinity) {
    combined.exportTotalFrames = Math.floor(
      combined.exportFps * combined.duration / 1e3
    );
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
      scaleContext: settings.scaleContext,
      attributes: settings.attributes
    }));
  } else {
    if (settings.canvas.nodeName.toLowerCase() !== "canvas") {
      throw new Error("provided canvas must be an HTMLCanvasElement");
    }
    canvas = settings.canvas;
    if (settings.parent) {
      toHTMLElement(settings.parent).appendChild(canvas);
    }
    ({ context, width, height } = resizeCanvas({
      canvas,
      mode,
      width: settings.dimensions ? settings.dimensions[0] : canvas.width,
      height: settings.dimensions ? settings.dimensions[1] : canvas.height,
      pixelRatio,
      scaleContext: settings.scaleContext,
      attributes: settings.attributes
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
      scaleContext: settings.scaleContext,
      attributes: settings.attributes
    }));
  } else {
    if (settings.canvas.nodeName.toLowerCase() !== "canvas") {
      throw new Error("provided canvas must be an HTMLCanvasElement");
    }
    canvas = settings.canvas;
    if (settings.parent) {
      toHTMLElement(settings.parent).appendChild(canvas);
    }
    ({ context, gl, width, height } = resizeCanvas({
      canvas,
      mode,
      width: settings.dimensions ? settings.dimensions[0] : canvas.width,
      height: settings.dimensions ? settings.dimensions[1] : canvas.height,
      pixelRatio,
      scaleContext: settings.scaleContext,
      attributes: settings.attributes
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

// src/modes/canvas.ts
var prepareCanvas = async (settings) => {
  if (settings.mode === "2d") {
    return create2dCanvas(settings);
  } else if (settings.mode === "webgl") {
    return createWebglCanvas(settings);
  } else if (settings.mode === "ogl") {
    return (await import('./ogl-SXYU76IS.js')).createOglCanvas(settings);
  }
  return create2dCanvas(settings);
};

// src/helpers.ts
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

// src/recorders/export-frame.ts
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

// src/props.ts
var createProps = async ({
  settings,
  states
}) => {
  const {
    canvas,
    context,
    width,
    height,
    pixelRatio,
    gl,
    oglContext,
    oglRenderer
  } = await prepareCanvas(settings);
  const { exportFrame, update, togglePlay } = createFunctionProps({
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
    recording: false,
    exportFrame,
    togglePlay,
    update
  };
  let props;
  if (settings.mode === "2d") {
    props = {
      ...baseProps,
      context
    };
  } else if (settings.mode === "ogl") {
    props = {
      ...baseProps,
      oglContext,
      oglRenderer
    };
  } else {
    props = {
      ...baseProps,
      gl
    };
  }
  return props;
};
var createFunctionProps = ({
  canvas,
  settings,
  states
}) => {
  return {
    exportFrame: createExportFrameProp({ canvas, settings, states }),
    update: createUpdateProp({ canvas, prevSettings: settings, resizeCanvas: resizeCanvas }),
    togglePlay: createTogglePlay({ states })
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
var createTogglePlay = ({ states }) => {
  return () => {
    states.paused = !states.paused;
    if (states.paused) {
      states.pausedStartTime = states.timestamp;
    }
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
    }
    render(props);
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
var keydown_default = (props, states) => {
  const handleKeydown = (ev) => {
    if (ev.key === " ") {
      ev.preventDefault();
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
    } else if (ev.key === "t") {
      states.timeResetted = true;
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

// src/states.ts
var createStates = ({
  settings
}) => {
  return {
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
    frameInterval: settings.playFps !== null ? 1e3 / settings.playFps : null,
    timeResetted: false
  };
};
var muxer = null;
var videoEncoder = null;
var lastKeyframe = null;
var exportWebM = async ({
  canvas,
  settings,
  states,
  props
}) => {
  const { framesFormat: format } = settings;
  if (format !== "webm") {
    throw new Error("currently, only webm video format is supported");
  }
  if (!states.captureDone) {
    encodeVideoFrame({ canvas, settings, states, props });
    props.recording = true;
  }
  if (states.captureDone) {
    endWebMRecord({ canvas, settings });
    props.recording = false;
  }
};
var setupWebMRecord = ({
  canvas,
  settings
}) => {
  const { framesFormat: format } = settings;
  if (format !== "webm") {
    throw new Error("currently, only webm video format is supported");
  }
  muxer = new WebMMuxer({
    target: "buffer",
    video: {
      codec: "V_VP9",
      width: canvas.width,
      height: canvas.height,
      frameRate: settings.exportFps
    }
  });
  videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer?.addVideoChunk(chunk, meta),
    error: (e) => console.error(`WebMMuxer error: ${e}`)
  });
  videoEncoder.configure({
    codec: "vp09.00.10.08",
    width: canvas.width,
    height: canvas.height,
    bitrate: 4e6
  });
  lastKeyframe = -Infinity;
  canvas.style.outline = `3px solid red`;
  canvas.style.outlineOffset = `-3px`;
  console.log(`recording (${format}) started`);
};
var endWebMRecord = async ({
  canvas,
  settings
}) => {
  const { framesFormat: format } = settings;
  await videoEncoder?.flush();
  const buffer = muxer?.finalize();
  downloadBlob(new Blob([buffer]), settings);
  muxer = null;
  videoEncoder = null;
  canvas.style.outline = "none";
  canvas.style.outlineOffset = `0 `;
  console.log(`recording (${format}) complete`);
};
var encodeVideoFrame = ({
  canvas,
  settings,
  states,
  props
}) => {
  const frame = new VideoFrame(canvas, { timestamp: props.time * 1e3 });
  const needsKeyframe = props.time - lastKeyframe >= 2e3;
  if (needsKeyframe)
    lastKeyframe = props.time;
  videoEncoder?.encode(frame, { keyFrame: needsKeyframe });
  frame.close();
  const totalFrames = Math.floor(
    settings.exportFps * settings.duration / 1e3
  );
  console.log(
    `%crecording frame... %c${props.frame + 1} of ${totalFrames}`,
    `color:black`,
    `color:#9aa`
  );
};
var downloadBlob = (blob, settings) => {
  const { filename, prefix, suffix, framesFormat: format } = settings;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${formatFilename({
    filename,
    prefix,
    suffix
  })}.${format}`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// src/index.ts
var sketchWrapper = async (sketch, userSettings) => {
  const settings = createSettings({
    main: userSettings
  });
  const states = createStates({ settings });
  const props = await createProps({
    settings,
    states
  });
  const { canvas } = props;
  const returned = sketch(props);
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
  const { add: addResize, handleResize } = resize_default(
    canvas,
    props,
    userSettings,
    settings,
    render,
    resize
  );
  const { add: addKeydown } = keydown_default(props, states);
  handleResize();
  const loop = (timestamp) => {
    states.timestamp = timestamp - states.pausedDuration;
    if (!states.savingFrames)
      playLoop({ timestamp, settings, states, props });
    else
      recordLoop({ canvas, settings, states, props });
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
    settings: settings2,
    states: states2,
    props: props2
  }) => {
    if (states2.paused) {
      states2.pausedDuration = timestamp - states2.pausedStartTime;
      window.requestAnimationFrame(loop);
      return;
    }
    if (states2.timeResetted) {
      resetTime({ settings: settings2, states: states2, props: props2 });
    }
    props2.time = states2.timestamp - states2.startTime;
    if (props2.time >= props2.duration) {
      resetTime({ settings: settings2, states: states2, props: props2 });
    }
    props2.deltaTime = states2.timestamp - states2.lastTimestamp;
    if (states2.frameInterval !== null) {
      if (props2.deltaTime < states2.frameInterval) {
        window.requestAnimationFrame(loop);
        return;
      }
    }
    computePlayhead({
      settings: settings2,
      props: props2
    });
    computeFrame({ settings: settings2, states: states2, props: props2 });
    computeLastTimestamp({ states: states2, props: props2 });
    render(props2);
    window.requestAnimationFrame(loop);
  };
  let frameCount = 0;
  const recordLoop = ({
    canvas: canvas2,
    settings: settings2,
    states: states2,
    props: props2
  }) => {
    if (!states2.captureReady) {
      resetTime({ settings: settings2, states: states2, props: props2 });
      setupWebMRecord({ canvas: canvas2, settings: settings2 });
      states2.captureReady = true;
    }
    props2.deltaTime = 1e3 / settings2.exportFps;
    props2.time = frameCount * props2.deltaTime;
    computePlayhead({
      settings: settings2,
      props: props2
    });
    props2.frame = frameCount;
    computeLastTimestamp({ states: states2, props: props2 });
    render(props2);
    window.requestAnimationFrame(loop);
    frameCount += 1;
    if (props2.frame >= settings2.exportTotalFrames) {
      states2.captureDone = true;
    }
    exportWebM({ canvas: canvas2, settings: settings2, states: states2, props: props2 });
    if (states2.captureDone) {
      states2.captureReady = false;
      states2.captureDone = false;
      states2.savingFrames = false;
      states2.timeResetted = true;
      frameCount = 0;
    }
  };
};
var src_default = sketchWrapper;

export { src_default as default };
