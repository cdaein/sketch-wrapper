import { GIFEncoder, quantize, applyPalette } from "gifenc";
import { downloadBlob } from "../helpers";
import { BaseProps, SketchSettingsInternal, SketchStates } from "../types";

let gif: any;

export const setupGifAnimRecord = ({
  canvas,
  settings,
}: {
  canvas: HTMLCanvasElement;
  settings: SketchSettingsInternal;
}) => {
  const { framesFormat: format } = settings;

  gif = GIFEncoder();

  canvas.style.outline = `3px solid red`;
  canvas.style.outlineOffset = `-3px`;

  console.log(`recording (${format}) started`);
};

export const exportGifAnim = ({
  canvas,
  context,
  settings,
  states,
  props,
}: {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | WebGLRenderingContext;
  settings: SketchSettingsInternal;
  states: SketchStates;
  props: BaseProps;
}) => {
  if (!states.captureDone) {
    // record frame
    let data: Uint8ClampedArray;
    if (settings.mode === "2d") {
      data = (context as CanvasRenderingContext2D).getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      ).data;
      const palette = quantize(data, 256);
      const index = applyPalette(data, palette);

      const fpsInterval = 1 / settings.exportFps;
      const delay = fpsInterval * 1000;
      gif.writeFrame(index, canvas.width, canvas.height, { palette, delay });
    } else if (settings.mode === "webgl" || settings.mode === "ogl") {
      // REVIEW: "ogl" uses WebGL2RenderingContext. sketch-wrapper doesn't yet support WebGL2
      //         but it seems they share many properties, and gif export works for now.

      // REVIEW: https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/readPixels
      const gl = context as WebGLRenderingContext;
      const pixels = new Uint8Array(
        gl.drawingBufferWidth * gl.drawingBufferHeight * 4
      );
      //prettier-ignore
      gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, 
                    gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      // console.log(pixels); // Uint8Array
      const palette = quantize(pixels, 256);
      const index = applyPalette(pixels, palette);

      const fpsInterval = 1 / settings.exportFps;
      const delay = fpsInterval * 1000;
      gif.writeFrame(index, canvas.width, canvas.height, { palette, delay });
    }
  }

  // TODO: where to put this warning?
  //       should i automatically clamp fps AND duration?
  if (settings.exportFps > 50) {
    console.warn(
      "clamping fps to 50, which is the maximum for GIF. animation duration will be inaccurate."
    );
  }

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

export const endGifAnimRecord = ({
  canvas,
  settings,
}: {
  canvas: HTMLCanvasElement;
  settings: SketchSettingsInternal;
}) => {
  const { framesFormat: format } = settings;

  gif.finish();
  // REVIEW: buffer type
  const buffer: ArrayBuffer = gif.bytesView();

  downloadBlob(new Blob([buffer], { type: "image/gif" }), settings);

  canvas.style.outline = "none";
  canvas.style.outlineOffset = `0 `;

  console.log(`recording (${format}) complete`);
};
