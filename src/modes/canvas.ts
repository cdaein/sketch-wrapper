import { create2dCanvas } from "./2d";
import { createWebglCanvas } from "./webgl";
import type { SketchSettingsInternal } from "../types";

export const prepareCanvas = async (
  settings: SketchSettingsInternal
): Promise<
  | {
      canvas: HTMLCanvasElement;
      context?:
        | CanvasRenderingContext2D
        | WebGLRenderingContext
        | WebGL2RenderingContext
        | undefined;
      width: number;
      height: number;
      pixelRatio: number;
      gl?: WebGLRenderingContext | WebGL2RenderingContext | undefined;
    }
  | undefined
> => {
  if (settings.mode === "2d") {
    return create2dCanvas(settings);
  } else if (settings.mode === "webgl" || settings.mode === "webgl2") {
    return createWebglCanvas(settings);
  } else if (settings.mode === "ogl") {
    throw new Error("ogl mode is no longer supported");
    // REVIEW: without this, code splitting doesn't work and get missing file error!!
    // return (await import("./ogl")).createOglCanvas(settings);
  }

  // fallback
  return create2dCanvas(settings);
};
