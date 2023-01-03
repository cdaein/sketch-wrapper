import { createCanvas, resizeCanvas } from "@daeinc/canvas";
import { toDomElement } from "@daeinc/dom";
import type { SketchSettingsInternal } from "./types";

export const prepareCanvas = (settings: SketchSettingsInternal) => {
  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;
  let [width, height] = settings.dimensions;
  const pixelRatio = Math.max(settings.pixelRatio, 1);

  if (settings.canvas === undefined || settings.canvas === null) {
    // new canvas
    ({ canvas, context, width, height } = createCanvas({
      parent: settings.parent,
      width,
      height,
      pixelRatio,
      scaleContext: settings.scaleContext,
    }));
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
  }

  return { canvas, context, width, height, pixelRatio };
};
