import { Renderer, OGLRenderingContext } from "ogl-typescript";

// TODO: proper typing
export type Sketch = (props: SketchProps) => SketchRender | SketchReturnObject;
export interface SketchReturnObject {
  render?: SketchRender;
  resize?: SketchResize;
}
export type SketchRender = (props: SketchProps) => void;
export type SketchResize = (props: SketchProps) => void;
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
  title?: string;
  background?: string;
  // canvas
  parent?: HTMLElement | string;
  canvas?: HTMLCanvasElement;
  dimensions?: [number, number];
  pixelRatio?: number;
  centered?: boolean;
  scaleContext?: boolean;
  pixelated?: boolean;
  // animation
  animate?: boolean;
  playFps?: number;
  exportFps?: number;
  duration?: number;
  // out file
  filename?: string;
  prefix?: string;
  suffix?: string;
  frameFormat?: FrameFormat;
  framesFormat?: FramesFormat;
  // sketch
  hotkeys?: boolean;
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

// REVIEW: separate updatable/writable props (during life of a sketch), and fixed/readable props
/**
 * Object that is sent to users to access its properties. some values update while animating.
 */
export interface SketchProps {
  /** `HTMLCanvasElement` */
  canvas: HTMLCanvasElement;
  // REVIEW: creteCanvas() assigns webgl context to both context and gl
  context: CanvasRenderingContext2D;
  gl: WebGLRenderingContext | OGLRenderingContext;
  /** canvas width. may be different from canvas.width due to pixel ratio scaling */
  width: number;
  /** canvas height. may be different from canvas.height due to pixel ratio scaling */
  height: number;
  /** try window.devicePixelRatio to get the high resolution if your display supports */
  pixelRatio: number;
  // animation
  // animate: boolean;
  /** when `settings.duration` is set, playhead will repeat 0..1 over duration */
  playhead: number;
  /** frame count. starting at 0 */
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
  update: (settings: SketchSettings) => void;
  // ogl prop
  /** OGL renderer object */
  renderer?: Renderer;
}
