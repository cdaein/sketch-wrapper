type Sketch = (props: SketchProps) => SketchRender | SketchReturnObject;
interface SketchReturnObject {
    render?: SketchRender;
    resize?: SketchResize;
}
type SketchRender = (props: SketchProps) => void;
type SketchResize = (props: SketchProps) => void;
type SketchMode = "2d" | "webgl";
type FrameFormat = "png" | "jpg" | "jpeg" | "webp";
type FramesFormat = "mp4" | "png" | "jpg" | "jpeg" | "gif" | "webm";
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
interface SketchProps {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    gl: WebGLRenderingContext;
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
}

declare const sketchWrapper: (sketch: Sketch, userSettings: SketchSettings) => void;

export { FrameFormat, FramesFormat, Sketch, SketchProps, SketchRender, SketchResize, SketchSettings, sketchWrapper };
