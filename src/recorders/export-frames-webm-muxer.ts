/**
 * TODO: maybe convert functions into a single class??
 * WebM Muxer: https://github.com/Vanilagy/webm-muxer/blob/main/demo/script.js
 */

import type { SketchStates, SketchSettingsInternal, BaseProps } from "../types";
import WebMMuxer from "webm-muxer";
import { formatFilename } from "../helpers";

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
  props: BaseProps;
}) => {
  const { framesFormat: format } = settings;

  if (format !== "webm") {
    throw new Error("currently, only webm video format is supported");
  }

  if (!states.captureDone) {
    // record frame
    encodeVideoFrame({ canvas, settings, states, props });
  }

  if (states.captureDone) {
    endWebMRecord({ settings });
  }
};

export const setupWebMRecord = ({
  canvas,
  settings,
}: {
  canvas: HTMLCanvasElement;
  settings: SketchSettingsInternal;
}) => {
  const { framesFormat: format } = settings;

  if (format !== "webm") {
    throw new Error("currently, only webm video format is supported");
  }

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
    codec: "vp09.00.10.08", // TODO: look at other codecs
    width: canvas.width,
    height: canvas.height,
    bitrate: 1e7, // 1e7 = 10 Mbps
  });

  lastKeyframe = -Infinity;

  console.log(`recording (${format}) started`);
};

export const endWebMRecord = async ({
  settings,
}: {
  settings: SketchSettingsInternal;
}) => {
  // end record
  const { framesFormat: format } = settings;

  await videoEncoder?.flush();
  const buffer = muxer?.finalize();

  downloadBlob(new Blob([buffer!]), settings);

  muxer = null;
  videoEncoder = null;

  console.log(`recording (${format}) complete`);
};

export const encodeVideoFrame = ({
  canvas,
  settings,
  states,
  props,
}: {
  canvas: HTMLCanvasElement;
  settings: SketchSettingsInternal;
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

  // TODO: this should be in settings, states or props
  const totalFrames = Math.floor(
    (settings.exportFps * settings.duration) / 1000
  );
  console.log(
    `%crecording frame... %c${props.frame + 1} of ${totalFrames}`,
    `color:black`,
    `color:#9aa`
  );
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
