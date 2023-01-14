import type { SketchSettingsInternal } from "../types";
// import { Renderer } from "ogl-typescript";
import { setupCanvas } from "@daeinc/canvas";

export const createOglCanvas = async (settings: SketchSettingsInternal) => {
  let [width, height] = settings.dimensions;
  let pixelRatio = Math.max(settings.pixelRatio, 1);

  const attributes = settings.attributes as WebGLContextAttributes;

  try {
    const Renderer = (await import("ogl-typescript")).Renderer;
    const renderer = new Renderer({
      width,
      height,
      dpr: settings.pixelRatio,
      // TODO: add attributes {} to settings
      //       enalbes image export with OGLContext. but it can make things slower
      // preserveDrawingBuffer: true,
      ...attributes,
    });
    const gl = renderer.gl;
    let canvas = gl.canvas;

    ({ canvas, width, height, pixelRatio } = setupCanvas({
      parent: settings.parent,
      canvas,
      width,
      height,
      pixelRatio,
    }));

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
  } catch (e) {
    //
  }
};
