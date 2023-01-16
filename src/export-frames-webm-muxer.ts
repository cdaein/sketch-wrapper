import type {
  SketchStates,
  SketchSettingsInternal,
  SketchProps,
  WebGLProps,
  OGLProps,
  BaseProps,
} from "./types";
import WebMMuxer from "webm-muxer";
import { formatFilename } from "./helpers";

let muxer: WebMMuxer | null = null;
let videoEncoder: VideoEncoder | null = null;
let lastKeyframe: number | null = null;

export const exportWebM = async ({
  canvas,
  settings,
  states,
  props,
}: {
  canvas: HTMLCanvasElement;
  states: SketchStates;
  settings: SketchSettingsInternal;
  props: SketchProps | WebGLProps | OGLProps;
}) => {
  const { framesFormat: format } = settings;

  if (format !== "webm") {
    throw new Error("currently, only webm video format is supported");
  }

  if (!states.captureReady) {
    // recorder setup
    // WebMMuxer: https://github.com/Vanilagy/webm-muxer/blob/main/demo/script.js
    muxer = new WebMMuxer({
      target: "buffer",
      video: {
        codec: "V_VP9", // TODO: need to check browser support first (ie. Firefox)
        width: canvas.width,
        height: canvas.height,
        frameRate: settings.exportFps,
      },
    });

    videoEncoder = new VideoEncoder({
      output: (chunk, meta) => muxer?.addVideoChunk(chunk, meta),
      error: (e) => console.error(`WebMMuxer error: ${e}`),
    });

    videoEncoder.configure({
      codec: "vp09.00.10.08",
      width: canvas.width,
      height: canvas.height,
      bitrate: 1e7, // 1e7 = 10 Mbps
    });

    lastKeyframe = -Infinity;

    states.captureReady = true;

    console.log(`recording (${format}) started`);
  }

  if (!states.captureDone) {
    // record frame
    encodeVideoFrame({ canvas, states, props });
    // TODO: this should be in settings, states or props
    const totalFrames = Math.floor(
      (settings.exportFps * settings.duration) / 1000
    );
    console.log(`recording frame... ${props.frame} of ${totalFrames}`);
  }

  if (states.captureDone) {
    // end record
    await videoEncoder?.flush();
    const buffer = muxer?.finalize();

    downloadBlob(new Blob([buffer!]), settings);

    muxer = null;
    videoEncoder = null;
    states.captureDone = false;
    states.savingFrames = false;
    states.captureReady = false;

    console.log(`recording (${format}) complete`);

    console.log(states.captureDone);
  }
};

const encodeVideoFrame = ({
  canvas,
  states,
  props,
}: {
  canvas: HTMLCanvasElement;
  states: SketchStates;
  props: BaseProps;
}) => {
  // timestamp unit is micro-seconds!!
  const frame = new VideoFrame(canvas, { timestamp: props.time * 1000 });

  // add video keyframe at least every 10 seconds (10000ms)
  const needsKeyframe = props.time - lastKeyframe! >= 10000;
  if (needsKeyframe) lastKeyframe = props.time;

  videoEncoder?.encode(frame, { keyFrame: needsKeyframe });
  frame.close();
};

const downloadBlob = (blob: Blob, settings: SketchSettingsInternal) => {
  const { filename, prefix, suffix, framesFormat: format } = settings;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${formatFilename({
    filename,
    prefix,
    suffix,
  })}.${format}`;
  a.click();
  window.URL.revokeObjectURL(url);
};
