import { create2dCanvas } from "./2d";
// import { createOglCanvas } from "./ogl";
import { createWebglCanvas } from "./webgl";
import type { SketchSettingsInternal } from "../types";
import type { Renderer, OGLRenderingContext } from "ogl-typescript";
import type p5 from "p5";
import { createP5Canvas } from "./p5";

export const prepareCanvas = async (
  settings: SketchSettingsInternal
): Promise<
  | {
      canvas: HTMLCanvasElement;
      context?: CanvasRenderingContext2D | WebGLRenderingContext | undefined;
      width: number;
      height: number;
      pixelRatio: number;
      gl?: WebGLRenderingContext | undefined;
      oglContext?: OGLRenderingContext | undefined;
      oglRenderer?: Renderer | undefined;
      p5?: p5 | undefined;
    }
  | undefined
> => {
  if (settings.mode === "2d") {
    return create2dCanvas(settings);
  } else if (settings.mode === "webgl") {
    return createWebglCanvas(settings);
  } else if (settings.mode === "ogl") {
    // REVIEW: without this, code splitting doesn't work and get missing file error!!
    return (await import("./ogl")).createOglCanvas(settings);
  } else if (settings.mode === "p5") {
    // TODO: to return p5 canvas, we need to have created p5 object
    // return createP5Canvas(settings);
  }

  // fallback
  return create2dCanvas(settings);
};
