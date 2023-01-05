import type { SketchSettingsInternal } from "../types";
import { Renderer } from "ogl-typescript";
import { createCanvas } from "@daeinc/canvas";

export const createOglCanvas = (settings: SketchSettingsInternal) => {
  let canvas: HTMLCanvasElement;
  // let context: CanvasRenderingContext2D | WebGLRenderingContext;
  let gl;
  let [width, height] = settings.dimensions;
  const pixelRatio = Math.max(settings.pixelRatio, 1);

  // REVIEW: should i create a new canvas for ogl?
  //         and read as renderer.gl.canvas?
  //         creating a pure webgl context and overwriting with OGL context seems a bit hacky
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

  return {
    canvas,
    oglContext: gl,
    oglRenderer: renderer,
    width,
    height,
    pixelRatio,
  };
};
