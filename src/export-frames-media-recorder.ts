/**
 * REVIEW:
 * need to decide in which environment the sketch will run.
 * - dev env: run with node.js, and use ffmpeg, specify download folder (same as sketch folder)
 * - front end: run within browser, download in Downloads or saveAs dialog.
 *
 * mp4 recording:
 * - for now, I'm using canvas-capture, but I do want to try other options.
 * - browser-side mp4 export is good, but ...
 *   - the library is too big (CCapture is included, not as a dependency.)
 *   - exporting is very slow (save as webm => convert to mp4)
 *   - quality?
 */

import type {
  SketchStates,
  SketchSettingsInternal,
  SketchProps,
  WebGLProps,
  OGLProps,
} from "./types";
import { formatFilename } from "./helpers";

let stream: MediaStream;
let recorder: MediaRecorder;
const chunks: Blob[] = [];

export const saveCanvasFrames = ({
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
  const { filename, prefix, suffix, framesFormat: format } = settings;

  if (format !== "webm") {
    throw new Error("currently, only webm video format is supported");
  }

  // set up recording once at beginning of recording
  if (!states.captureReady) {
    stream = canvas.captureStream(0);
    const options: MediaRecorderOptions = {
      // default is 2.5Mbps = 2500 * 1000
      videoBitsPerSecond: 50000 * 1000, // bps * 1000 = kbps
      mimeType: "video/webm; codecs=vp9",
    };
    recorder = new MediaRecorder(stream, options);

    recorder.ondataavailable = (e: BlobEvent) => {
      chunks.push(e.data);
      console.log(chunks);
    };

    recorder.onstop = (e) => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${formatFilename({
        filename,
        prefix,
        suffix,
      })}.${format}`;
      link.href = url;
      link.click();
    };

    states.captureReady = true;
    recorder.start();

    console.log("video recording started");
  }

  // record frame
  (stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack).requestFrame();

  if (states.captureDone) {
    // FIX: when recorder stops, last frame is not recorded
    recorder.stop();
    console.log("video recording complete");
    states.captureDone = false;
    states.savingFrames = false;
    states.captureReady = false;
  }
};