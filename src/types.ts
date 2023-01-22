import { Format as GifFormat } from "gifenc";
import type p5 from "p5";

/** SketchWrapper takes sketch function and settings object to set up new or existing canvas, and provides props for users */
export type SketchWrapper = (sketch: Sketch, settings: SketchSettings) => void;
/** sketch function to be used as argument for sketchWrapper() */
export type Sketch = (
  props: SketchProps | WebGLProps
) => SketchRender | SketchReturnObject;
export interface SketchReturnObject {
  render?: SketchRender;
  resize?: SketchResize;
}
/** sketch render callback function; will be called every frame */
export type SketchRender = (props: SketchProps | WebGLProps) => void;
/** sketch resize callback function; runs when window is resized. it also runs when sketch is first loaded */
export type SketchResize = (props: SketchProps | WebGLProps) => void;
export type SketchLoop = (timestamp: number) => void;

export type SketchMode = "2d" | "webgl" | "webgl2";

// gif is not supported by default
export type FrameFormat = "png" | "jpg" | "jpeg" | "webp";

// video or image sequence
// export type FramesFormat = "mp4" | "png" | "jpg" | "jpeg" | "gif" | "webm";
export type FramesFormat = "gif" | "webm";

export type GifOptions = {
  maxColors?: number;
  format?: GifFormat;
  palette?: number[][];
  // knownColors?: string[]
};

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
  /** context attributes for 2d or webgl canvas */
  attributes?: CanvasRenderingContext2DSettings | WebGLContextAttributes;
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
  /** set file format for image export (ie. png, jpeg). you can also use array to export multiple formats at the same time. ex. ["webp", "png"] */
  frameFormat?: FrameFormat | FrameFormat[];
  /** set file format for video/sequence export (ie. webm, gif). you can also use array to export multiple formats at the same time. ex. ["gif", "webm"] */
  framesFormat?: FramesFormat | FramesFormat[];
  /** GIF export options. */
  gifOptions?: GifOptions;
  // sketch
  /** set to `false` to not use sketch-wrapper provided hot keys (ex. `CMD+S` for image export) */
  hotkeys?: boolean;
  /** set sketch mode to use or integrate with other libraries */
  mode?: SketchMode;
};

/**
 * Settings that are used internally for development.
 */
export interface SketchSettingsInternal {
  // document
  title: string;
  background: string;
  // canvas
  mode: SketchMode;
  parent: HTMLElement | string;
  canvas: HTMLCanvasElement | null; // if null, new canvas will be created
  dimensions: [number, number];
  pixelRatio: number;
  centered: boolean;
  scaleContext: boolean;
  pixelated: boolean;
  attributes?: CanvasRenderingContext2DSettings | WebGLContextAttributes;
  // animation
  animate: boolean;
  playFps: number | null; // if null, will use display's maximum fps
  exportFps: number;
  duration: number;
  totalFrames: number;
  exportTotalFrames: number;
  // out file
  filename: string;
  prefix: string;
  suffix: string;
  frameFormat: FrameFormat[];
  framesFormat: FramesFormat[];
  gifOptions: GifOptions;
  // sketch
  hotkeys: boolean;
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
  pausedDuration: number;
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
  /** true if recording in progress */
  recording: boolean;
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

export interface P5Props extends BaseProps {
  p5: p5;
}

/**
 * props type specific to `webgl` or `webgl2` mode
 */
export interface WebGLProps extends BaseProps {
  /** webgl context */
  gl: WebGLRenderingContext;
}
