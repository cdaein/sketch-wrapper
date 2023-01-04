// TODO: proper typing
export type Sketch = (props: SketchProps) => SketchRender | SketchReturnObject;
export interface SketchReturnObject {
  render?: SketchRender;
  resize?: SketchResize;
}
export type SketchRender = (props: SketchProps) => void;
export type SketchResize = (props: SketchProps) => void;
export type SketchLoop = (timestamp: number) => void;

export type SketchMode = "2d" | "webgl";

// gif is not supported by default
export type FrameFormat = "png" | "jpg" | "jpeg" | "webp";

// video or image sequence
export type FramesFormat = "mp4" | "png" | "jpg" | "jpeg" | "gif" | "webm";

// user provided settings. all optional and properties must come from Internal or this type
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

// this is what gets used internally. there should be no undefined values.
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
export interface SketchProps {
  // canvas
  canvas: HTMLCanvasElement;
  // REVIEW: creteCanvas() assigns webgl context to both context and gl
  context: CanvasRenderingContext2D;
  gl: WebGLRenderingContext;
  width: number;
  height: number;
  pixelRatio: number;
  // animation
  // animate: boolean;
  playhead: number;
  frame: number;
  time: number;
  deltaTime: number;
  duration: number;
  totalFrames: number;
  exportFrame: () => void;
  togglePlay: () => void;
  update: (settings: SketchSettings) => void;
}
