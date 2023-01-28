import type { SketchSettingsInternal } from "../types";
import { create2dOrWebGLCanvas } from "./2d-or-webgl";

export const destroyCanvas = (canvas: HTMLCanvasElement) => {
  if (canvas) {
    canvas.width = 0;
    canvas.height = 0;
    canvas.remove();
  }

  // TODO
  // also remove any reference to canvas
};

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
      gl?: WebGLRenderingContext | WebGL2RenderingContext | undefined;
      width: number;
      height: number;
      pixelRatio: number;
    }
  | undefined
> => {
  if (settings.canvas !== null && settings.canvas !== undefined) {
    if (settings.canvas.nodeName.toLowerCase() !== "canvas") {
      throw new Error("provided canvas must be an HTMLCanvasElement");
    }
  }
  return create2dOrWebGLCanvas(settings);
};
