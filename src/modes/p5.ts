import type { Sketch, SketchSettingsInternal } from "../types";
// import { setupCanvas } from "@daeinc/canvas";
import { toHTMLElement } from "@daeinc/dom";
import type p5 from "p5";
import { numberToRGB } from "ogl-typescript/lib/math/functions/ColorFunc";

export const createP5Canvas = async (
  sketch: Sketch,
  settings: SketchSettingsInternal
) => {
  let p5: p5 | undefined;
  let [width, height] = settings.dimensions;
  let pixelRatio = Math.max(settings.pixelRatio, 1);

  // TODO; check for settings.canvas === null | undefined

  const p5Constructor = (await import("p5")).default;

  const p5Sketch = (p: p5) => {
    let renderFn;

    p.setup = () => {
      // TODO: "2d" or "webgl" ( 2 different sketch mode "p5" and "p5-webgl")
      const p5Renderer = p.createCanvas(width, height, p.P2D); // 2d mode
      p.pixelDensity(pixelRatio);
      // TODO: set context attributes "2d"?
      // p.setAttributes()
      p.noLoop(); // will use our own draw loop

      p5 = p;

      console.log("wrapper setup");
      // need to run sketch function once to set everything up
      // renderFn = sketch(props)
    };

    // draw will be stored
    // REVIEW: can i assign p.draw later after p5Object is created?
    // p.draw = () => renderFn(props);
  };

  const p5Object = new p5Constructor(
    p5Sketch,
    settings.parent ? toHTMLElement(settings.parent) : undefined
  );

  // REVIEW: there's no type definition although p5Object.canvas exists
  // @ts-ignore
  const canvas: HTMLCanvasElement = p5Object.canvas;
  // const context: CanvasRenderingContext2D = p5Object.drawingContext;

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

  if (p5) {
    return {
      p5,
      canvas,
      width,
      height,
      pixelRatio,
    };
  } else {
    throw new Error("could not create p5 canvas");
  }
};
