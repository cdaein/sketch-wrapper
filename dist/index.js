import { createCanvas, resizeCanvas } from '@daeinc/canvas';
import { toDomElement } from '@daeinc/dom';

// src/time.ts
var computePlayhead = ({
  settings,
  states,
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
      toDomElement(settings.parent).appendChild(canvas);
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
      toDomElement(settings.parent).appendChild(canvas);
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

// src/canvas.ts
var prepareCanvas = async (settings) => {
  if (settings.mode === "2d") {
    return create2dCanvas(settings);
  } else if (settings.mode === "webgl") {
    return createWebglCanvas(settings);
  } else if (settings.mode === "ogl") {
    return (await import('./ogl-U7V5DNAD.js')).createOglCanvas(settings);
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

// src/export-frame.ts
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
var resize_default = (canvas, props, userSettings, settings, states, render, resize) => {
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
var keydown_default = (canvas, props, settings, states, loop) => {
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

// src/export-frames-media-recorder.ts
var stream;
var recorder;
var chunks = [];
var saveCanvasFrames = ({
  canvas,
  settings,
  states,
  props
}) => {
  const { filename, prefix, suffix, framesFormat: format } = settings;
  if (format !== "webm") {
    throw new Error("currently, only webm video format is supported");
  }
  if (!states.captureReady) {
    stream = canvas.captureStream(settings.exportFps);
    const options = {
      videoBitsPerSecond: 5e4 * 1e3,
      mimeType: "video/webm; codecs=vp9"
    };
    recorder = new MediaRecorder(stream, options);
    chunks.length = 0;
    recorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };
    recorder.onstop = (e) => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${formatFilename({
        filename,
        prefix,
        suffix
      })}.${format}`;
      link.href = url;
      link.click();
    };
    states.captureReady = true;
    recorder.start();
    console.log("video recording started");
  }
  if (!states.captureDone) {
    stream.getVideoTracks()[0].requestFrame();
  }
  if (states.captureDone) {
    recorder.stop();
    console.log("video recording complete");
    states.captureDone = false;
    states.savingFrames = false;
    states.captureReady = false;
  }
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
  let recordedFrames = 0;
  const loop = (timestamp) => {
    states.timestamp = timestamp - states.pausedDuration;
    if (!states.savingFrames) {
      if (states.paused) {
        states.pausedDuration = timestamp - states.pausedStartTime;
        window.requestAnimationFrame(loop);
        return;
      }
      if (states.timeResetted) {
        states.startTime = states.timestamp;
        props.time = 0;
        props.playhead = 0;
        props.frame = 0;
        states.lastTimestamp = 0;
        states.timeResetted = false;
        console.log("time resetted");
      }
      props.time = (states.timestamp - states.startTime) % props.duration;
      props.deltaTime = states.timestamp - states.lastTimestamp;
      if (states.frameInterval !== null) {
        if (props.deltaTime < states.frameInterval) {
          window.requestAnimationFrame(loop);
          return;
        }
      }
      console.log(props.time / props.duration);
      computePlayhead({
        settings,
        states,
        props
      });
      computeFrame({ settings, states, props });
      computeLastTimestamp({ states, props });
      if (settings.animate && !states.paused) {
        render(props);
        window.requestAnimationFrame(loop);
      }
    } else {
      if (!states.captureReady) {
        states.startTime = states.timestamp;
        props.time = 0;
        props.playhead = 0;
        props.frame = 0;
        console.log("reset to record");
      }
      props.time = recordedFrames * (1e3 / settings.exportFps);
      props.deltaTime = 1e3 / settings.exportFps;
      computePlayhead({
        settings,
        states,
        props
      });
      props.frame = recordedFrames;
      computeLastTimestamp({ states, props });
      render(props);
      window.requestAnimationFrame(loop);
      recordedFrames += 1;
      if (props.frame >= Math.floor(settings.exportFps * settings.duration / 1e3)) {
        states.captureDone = true;
        recordedFrames = 0;
        states.timeResetted = true;
      }
      saveCanvasFrames({ canvas, settings, states, props });
    }
  };
  if (settings.animate)
    window.requestAnimationFrame(loop);
  const { add: addResize, handleResize } = resize_default(
    canvas,
    props,
    userSettings,
    settings,
    states,
    render,
    resize
  );
  handleResize();
  const { add: addKeydown } = keydown_default(
    canvas,
    props,
    settings,
    states);
  if (settings.hotkeys) {
    addResize();
    addKeydown();
  }
};

export { sketchWrapper };
