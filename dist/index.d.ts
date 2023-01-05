import { OGLRenderingContext, Renderer } from 'ogl-typescript';

type Sketch = (props: SketchProps) => SketchRender | SketchReturnObject;
interface SketchReturnObject {
    render?: SketchRender;
    resize?: SketchResize;
}
type SketchRender = (props: SketchProps) => void;
type SketchResize = (props: SketchProps) => void;
type SketchMode = "2d" | "webgl" | "ogl";
type FrameFormat = "png" | "jpg" | "jpeg" | "webp";
type FramesFormat = "mp4" | "png" | "jpg" | "jpeg" | "gif" | "webm";
/**
 * User provided settings. all optional properties must either come from user. If not, it will be filled internally with default settings.
 */
type SketchSettings = {
    title?: string;
    background?: string;
    parent?: HTMLElement | string;
    canvas?: HTMLCanvasElement;
    dimensions?: [number, number];
    pixelRatio?: number;
    centered?: boolean;
    scaleContext?: boolean;
    pixelated?: boolean;
    animate?: boolean;
    playFps?: number;
    exportFps?: number;
    duration?: number;
    filename?: string;
    prefix?: string;
    suffix?: string;
    frameFormat?: FrameFormat;
    framesFormat?: FramesFormat;
    hotkeys?: boolean;
    mode?: SketchMode;
};
/**
 * Object that is sent to users to access its properties. some values update while animating.
 */
interface SketchProps {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    gl: WebGLRenderingContext | OGLRenderingContext;
    width: number;
    height: number;
    pixelRatio: number;
    playhead: number;
    frame: number;
    time: number;
    deltaTime: number;
    duration: number;
    totalFrames: number;
    exportFrame: () => void;
    togglePlay: () => void;
    update: (settings: SketchSettings) => void;
    renderer?: Renderer;
}

declare const sketchWrapper: (sketch: Sketch, userSettings: SketchSettings) => void;

export { FrameFormat, FramesFormat, Sketch, SketchProps, SketchRender, SketchResize, SketchSettings, sketchWrapper };
