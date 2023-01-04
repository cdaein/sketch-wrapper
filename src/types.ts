// TODO: proper typing
export type Sketch = (props: SketchProps) => SketchDraw;
export type SketchDraw = (props: SketchProps) => void;
export type SketchLoop = (timestamp: number) => void;

// REVIEW: updatable/writable props (during life of a sketch), and fixed/readable props
export interface SketchProps {
  // DOM
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  // canvas
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
}

// gif is not supported by default
export type FrameFormat = "png" | "jpg" | "jpeg" | "webp";

// video or image sequence
export type FramesFormat = "mp4" | "png" | "jpg" | "jpeg" | "gif" | "webm";

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
  hotkeys: boolean;
}

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
  hotkeys?: boolean;
};

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
