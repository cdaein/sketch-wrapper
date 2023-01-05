import { Renderer, OGLRenderingContext } from "ogl-typescript";

/** SketchWrapper takes sketch function and settings object to set up new or existing canvas, and provides props for users */
export type SketchWrapper = (sketch: Sketch, settings: SketchSettings) => void;
/** sketch function to be used as argument for sketchWrapper() */
export type Sketch = (
  props: SketchProps | OGLProps | WebGLProps
) => SketchRender | SketchReturnObject;
export interface SketchReturnObject {
  render?: SketchRender;
  resize?: SketchResize;
}
/** sketch render callback function; will be called every frame */
export type SketchRender = (props: SketchProps | OGLProps | WebGLProps) => void;
/** sketch resize callback function; runs when window is resized. it also runs when sketch is first loaded */
export type SketchResize = (props: SketchProps | OGLProps | WebGLProps) => void;
export type SketchLoop = (timestamp: number) => void;

export type SketchMode = "2d" | "webgl" | "ogl";

// gif is not supported by default
export type FrameFormat = "png" | "jpg" | "jpeg" | "webp";

// video or image sequence
export type FramesFormat = "mp4" | "png" | "jpg" | "jpeg" | "gif" | "webm";

/**
 * User provided settings. all optional properties must either come from user. If not, it will be filled internally with default settings.
 */
export type SketchSettings = {
  // document
  /** set HTML webpage title. it is placed inside `<title>` tag and displayed on top of browser window */
  title?: string;
  /** set background color of HTML page. uses CSS color string. ex. `#aaa` */
  background?: string;
  // canvas
  /** set canvas parent either as `HTMLElement` object or string selector. ex. `div#app` */
  parent?: HTMLElement | string;
  /** set it to use an existing canvas instead of using one provided by sketch-wrapper */
  canvas?: HTMLCanvasElement;
  /** [width, height] */
  dimensions?: [number, number];
  /** set pixel ratio */
  pixelRatio?: number;
  /** center canvas */
  centered?: boolean;
  /** scale context to account for pixelRatio */
  scaleContext?: boolean;
  /** not yet implemented */
  pixelated?: boolean;
  // animation
  /** set to `true` to play animation */
  animate?: boolean;
  /** set plackback frame rate */
  playFps?: number;
  /** set export frame rate for videos. (doesn't work yet) */
  exportFps?: number;
  /** set animation loop duration in milliseconds */
  duration?: number;
  // out file
  /** set export file name. if not set, sketch-wrapper uses datetime string */
  filename?: string;
  /** set prefix to file name */
  prefix?: string;
  /** set suffix to file name */
  suffix?: string;
  /** set file format for image export */
  frameFormat?: FrameFormat;
  /** set file format for video/sequence export (doesn't work yet) */
  framesFormat?: FramesFormat;
  // sketch
  /** set to `false` to not use sketch-wrapper provided hot keys (ex. `CMD+S` for image export) */
  hotkeys?: boolean;
  /** set sketch mode to use or integrate with other libraries */
  mode?: SketchMode;
};

/**
 * Settings that are used internally for development. There should be no undefined values.
 */
export interface SketchSettingsInternal {
  // document
  title: string;
  background: string;
  // canvas
  parent: HTMLElement | string;
  canvas: HTMLCanvasElement | null; // if null, new canvas will be created
  dimensions: [number, number];
  pixelRatio: number;
  centered: boolean;
  scaleContext: boolean;
  pixelated: boolean;
  // animation
  animate: boolean;
  playFps: number | null; // if null, will use display's maximum fps
  exportFps: number;
  duration: number;
  totalFrames: number;
  // out file
  filename: string;
  prefix: string;
  suffix: string;
  frameFormat: FrameFormat;
  framesFormat: FramesFormat;
  // sketch
  hotkeys: boolean;
  mode: SketchMode;
}

export interface SketchStates {
  paused: boolean; // regardless of playMode, time is updating
  playMode: "play" | "record"; // REVIEW: "play:time", "play:frame" do i need this? or just use savingFrames:boolean?
  savingFrame: boolean;
  savingFrames: boolean;
  captureReady: boolean;
  captureDone: boolean;
  startTime: number;
  lastStartTime: number;
  pausedStartTime: number;
  pausedEndTime: number;
  timestamp: number;
  lastTimestamp: number;
  frameInterval: number | null;
  timeResetted: boolean;
}

/** props that are shared by all sketch modes */
export interface BaseProps {
  /** `HTMLCanvasElement` */
  canvas: HTMLCanvasElement;
  /** canvas width. may be different from canvas.width due to pixel ratio scaling */
  width: number;
  /** canvas height. may be different from canvas.height due to pixel ratio scaling */
  height: number;
  /** try `window.devicePixelRatio` to get the high resolution if your display supports */
  pixelRatio: number;
  // animation
  // animate: boolean;
  /** when `settings.duration` is set, playhead will repeat 0..1 over duration */
  playhead: number;
  /** frame count. starting at `0` */
  frame: number;
  /** elapsed time. when it reaches `duration`, it will reset to `0` */
  time: number;
  /** time it took between renders in milliseconds */
  deltaTime: number;
  /** animation duration in milliseconds. when it reaches the end, it will loop back to the beginning */
  duration: number;
  /** number of total frames over duration */
  totalFrames: number;
  /** call to export canvas as image */
  exportFrame: () => void;
  /** call to play or pause sketch */
  togglePlay: () => void;
  /** not yet implemented */
  update: (settings: SketchSettings) => void;
}

// REVIEW: separate updatable/writable props (during life of a sketch), and fixed/readable props

/**
 * to use with canvas with 2d sketches
 */
export interface SketchProps extends BaseProps {
  context: CanvasRenderingContext2D;
}

/**
 * props type specific to `mode: "webgl"`; to use with canvas with webgl context sketches
 */
export interface WebGLProps extends BaseProps {
  /** webgl context */
  gl: WebGLRenderingContext;
}

/**
 * props type specific to `mode: "ogl"`
 * */
export interface OGLProps extends BaseProps {
  /** OGL context */
  oglContext: OGLRenderingContext;
  /** OGL renderer object */
  oglRenderer: Renderer;
}
