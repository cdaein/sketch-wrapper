import { create2dCanvas } from "./2d";
// import { createOglCanvas } from "./ogl";
import { createWebglCanvas } from "./webgl";
import type { SketchSettingsInternal } from "../types";
import type { Renderer, OGLRenderingContext } from "ogl-typescript";

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
  }

  // fallback
  return create2dCanvas(settings);
};
