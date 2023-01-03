type Sketch = (props: SketchProps) => SketchDraw;
type SketchDraw = (props: SketchProps) => void;
interface SketchProps {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    width: number;
    height: number;
    pixelRatio: number;
    playhead: number;
    frame: number;
    time: number;
    deltaTime: number;
    duration: number;
    totalFrames: number;
}
type FrameFormat = "png" | "jpg" | "jpeg" | "gif" | "webp";
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
};

declare const sketchWrapper: (sketch: Sketch, userSettings: SketchSettings) => void;

export { FrameFormat, FramesFormat, Sketch, SketchDraw, SketchProps, SketchSettings, sketchWrapper };
