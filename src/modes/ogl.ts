import type { SketchSettingsInternal } from "../types";
import { Renderer } from "ogl-typescript";
import { createCanvas } from "@daeinc/canvas";

export const createOglCanvas = (settings: SketchSettingsInternal) => {
  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D | WebGLRenderingContext;
  let gl;
  let [width, height] = settings.dimensions;
  const pixelRatio = Math.max(settings.pixelRatio, 1);

  // create a new canvas
  ({ canvas, width, height } = createCanvas({
    parent: settings.parent,
    mode: "webgl",
    width,
    height,
    pixelRatio,
    scaleContext: settings.scaleContext,
  }));

  const renderer = new Renderer({
    canvas,
    width,
    height,
    dpr: settings.pixelRatio,
  });
  gl = renderer.gl;

  return { canvas, gl, renderer, width, height, pixelRatio };
};
