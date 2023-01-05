import { create2dCanvas } from "./modes/2d";
import { createOglCanvas } from "./modes/ogl";
import { createWebglCanvas } from "./modes/webgl";
import type { SketchSettingsInternal } from "./types";
import { Renderer, OGLRenderingContext } from "ogl-typescript";

export const prepareCanvas = (
  settings: SketchSettingsInternal
): {
  canvas: HTMLCanvasElement;
  context?: CanvasRenderingContext2D | WebGLRenderingContext;
  gl?: WebGLRenderingContext | OGLRenderingContext;
  renderer?: Renderer;
  width: number;
  height: number;
  pixelRatio: number;
} => {
  if (settings.mode === "2d") {
    return create2dCanvas(settings);
  } else if (settings.mode === "webgl") {
    return createWebglCanvas(settings);
  } else if (settings.mode === "ogl") {
    return createOglCanvas(settings);
  }
  // fallback
  return create2dCanvas(settings);
};
