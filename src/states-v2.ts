import type {
  SketchProps,
  SketchSettings,
  SketchSettingsInternal,
  SketchStates,
} from "./types";

interface SketchStatesV2 {
  settings: SketchSettingsInternal;
  states: SketchStates;
  props?: SketchProps;
}

export const statesV2: SketchStatesV2 = {
  settings: {
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
    exportTotalFrames: Infinity,
    // file
    filename: "",
    prefix: "",
    suffix: "",
    frameFormat: ["png"],
    framesFormat: ["webm"],
    gifOptions: {},
    // sketch
    hotkeys: true,
    mode: "2d",
  },
  states: {
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
    frameInterval: null,
    timeResetted: false,
  },
};
