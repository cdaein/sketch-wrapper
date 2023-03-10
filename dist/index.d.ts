import { Format } from 'gifenc';

/** SketchWrapper takes sketch function and settings object to set up new or existing canvas, and provides props for users */
type SketchWrapper = (sketch: Sketch, settings: SketchSettings) => Promise<void>;
/** sketch function to be used as argument for sketchWrapper() */
type Sketch = (props?: SketchProps | WebGLProps) => Promise<SketchRender> | Promise<SketchReturnObject>;
interface SketchReturnObject {
    render?: SketchRender;
    resize?: SketchResize;
}
/** sketch render callback function; will be called every frame */
type SketchRender = (props?: SketchProps | WebGLProps) => void | Promise<void>;
/** sketch resize callback function; runs when window is resized. it also runs when sketch is first loaded */
type SketchResize = (props?: SketchProps | WebGLProps) => void | Promise<void>;
type SketchMode = "2d" | "webgl" | "webgl2";
type FrameFormat = "png" | "jpg" | "jpeg" | "webp";
type FramesFormat = "gif" | "webm";
/** GIF encoding options */
type GifOptions = {
    /** max number of colors to use for quantizing each frame */
    maxColors?: number;
    format?: Format;
    /** use a palette instead of quantizing */
    palette?: number[][];
};
/**
 * User provided settings. all optional properties must either come from user. If not, it will be filled internally with default settings.
 */
type SketchSettings = {
    /** set HTML webpage title. it is placed inside `<title>` tag and displayed on top of browser window */
    title?: string;
    /** set background color of HTML page. uses CSS color string. ex. `#aaa` */
    background?: string;
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
    /** set to `true` to play animation */
    animate?: boolean;
    /** set plackback frame rate */
    playFps?: number;
    /** set export frame rate for videos. (doesn't work yet) */
    exportFps?: number;
    /** set animation loop duration in milliseconds */
    duration?: number;
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
    /** set to `false` to not use sketch-wrapper provided hot keys (ex. `CMD+S` for image export) */
    hotkeys?: boolean;
    /** set sketch mode to use or integrate with other libraries */
    mode?: SketchMode;
};
/** props that are shared by all sketch modes */
interface BaseProps {
    /** `HTMLCanvasElement` */
    canvas: HTMLCanvasElement;
    /** canvas width. may be different from canvas.width due to pixel ratio scaling */
    width: number;
    /** canvas height. may be different from canvas.height due to pixel ratio scaling */
    height: number;
    /** try `window.devicePixelRatio` to get the high resolution if your display supports */
    pixelRatio: number;
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
    /** manually call render function */
    /** call to export canvas as image */
    exportFrame: () => void;
    /** call to play or pause sketch */
    togglePlay: () => void;
    /** not yet implemented */
    update: (settings: SketchSettings) => void;
}
/**
 * to use with canvas with 2d sketches
 */
interface SketchProps extends BaseProps {
    context: CanvasRenderingContext2D;
}
/**
 * props type specific to `webgl` or `webgl2` mode
 */
interface WebGLProps extends BaseProps {
    /** webgl context */
    gl: WebGLRenderingContext;
}

declare const sketchWrapper: SketchWrapper;

export { FrameFormat, FramesFormat, GifOptions, Sketch, SketchProps, SketchRender, SketchResize, SketchSettings, WebGLProps, sketchWrapper as default };
