import { create2dCanvas } from "./modes/2d";
import { createWebglCanvas } from "./modes/webgl";
import type { SketchSettingsInternal } from "./types";

export const prepareCanvas = (
  settings: SketchSettingsInternal
): {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | WebGLRenderingContext;
  gl?: WebGLRenderingContext;
  width: number;
  height: number;
  pixelRatio: number;
} => {
  if (settings.mode === "2d") {
    return create2dCanvas(settings);
  } else if (settings.mode === "webgl") {
    return createWebglCanvas(settings);
  }
  // fallback
  return create2dCanvas(settings);
};
