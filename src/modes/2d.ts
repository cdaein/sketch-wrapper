import { createCanvas, resizeCanvas } from "@daeinc/canvas";
import { toDomElement } from "@daeinc/dom";
import type { SketchSettingsInternal } from "../types";

export const create2dCanvas = (settings: SketchSettingsInternal) => {
  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D | WebGLRenderingContext;
  let [width, height] = settings.dimensions;
  const pixelRatio = Math.max(settings.pixelRatio, 1);

  const mode = "2d";

  if (settings.canvas === undefined || settings.canvas === null) {
    // new 2d canvas
    ({ canvas, context, width, height } = createCanvas({
      parent: settings.parent,
      mode,
      width,
      height,
      pixelRatio,
      scaleContext: settings.scaleContext,
    })) as {
      canvas: HTMLCanvasElement;
      context: CanvasRenderingContext2D;
      width: number;
      height: number;
    };
  } else {
    if (settings.canvas.nodeName.toLowerCase() !== "canvas") {
      throw new Error("provided canvas must be an HTMLCanvasElement");
    }
    // existing canvas
    canvas = settings.canvas;
    if (settings.parent) {
      toDomElement(settings.parent).appendChild(canvas);
    }

    ({ context, width, height } = resizeCanvas({
      canvas,
      mode,
      width: settings.dimensions ? settings.dimensions[0] : canvas.width,
      height: settings.dimensions ? settings.dimensions[1] : canvas.height,
      pixelRatio,
      scaleContext: settings.scaleContext,
    }));
  }

  // canvas centering
  // TODO: needs extra scaling of style.width & height to fit window/container
  // REVIEW: this is probably be better done in index.html <style>
  //         but, for now, this module doesn't provide html file, so...
  if (settings.centered === true) {
    const canvasContainer = canvas.parentElement!;
    canvasContainer.style.width = "100vw";
    canvasContainer.style.height = "100vh";
    canvasContainer.style.display = "flex";
    canvasContainer.style.justifyContent = "center";
    canvasContainer.style.alignItems = "center";

    if (settings.scaleContext === false) {
      // TODO: centering does not work at pixelRatio=2
    }
  } else {
    // scale canvas even when not centered.
    canvas.style.width = 100 + "%";
    canvas.style.height = 100 + "%";
    canvas.style.maxWidth = `${settings.dimensions[0]}px`;
    canvas.style.maxHeight = `${settings.dimensions[1]}px`;
  }

  return { canvas, context, width, height, pixelRatio };
};
