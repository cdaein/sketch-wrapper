import type { SketchSettingsInternal } from "../types";
import p5, { p5InstanceExtensions } from "p5";
import { setupCanvas } from "@daeinc/canvas";
import { toDomElement } from "@daeinc/dom";

export const createP5Canvas = (settings: SketchSettingsInternal) => {
  let [width, height] = settings.dimensions;
  let pixelRatio = Math.max(settings.pixelRatio, 1);

  // TODO: set width, height, pixelRatio, attributes

  // const setup = (p: p5InstanceExtensions) => {
  //   return () => {
  //     const renderer = p.createCanvas(200, 200);
  //   };
  // };

  // const draw = (p: p5InstanceExtensions) => {
  //   return () => {
  //     p.background(200, 0, 0);
  //   };
  // };

  // const p5Sketch = (p: p5) => {
  //   p.setup = setup(p);

  //   p.draw = draw(p);
  // };

  // new p5(
  //   p5Sketch,
  //   // TODO: toDomElement: create toHTMLElement() / toElement()
  //   settings.parent ? toDomElement(settings.parent as HTMLElement) : undefined
  // );

  // ({ canvas, width, height, pixelRatio } = setupCanvas({
  //   parent: settings.parent,
  //   canvas,
  //   width,
  //   height,
  //   pixelRatio,
  // }));

  // // canvas centering
  // // TODO: needs extra scaling of style.width & height to fit window/container
  // // REVIEW: this is probably be better done in index.html <style>
  // //         but, for now, this module doesn't provide html file, so...
  // if (settings.centered === true) {
  //   const canvasContainer = canvas.parentElement!;
  //   canvasContainer.style.width = "100vw";
  //   canvasContainer.style.height = "100vh";
  //   canvasContainer.style.display = "flex";
  //   canvasContainer.style.justifyContent = "center";
  //   canvasContainer.style.alignItems = "center";

  //   if (settings.scaleContext === false) {
  //     // TODO: centering does not work at pixelRatio=2
  //   }
  // } else {
  //   // scale canvas even when not centered.
  //   canvas.style.width = 100 + "%";
  //   canvas.style.height = 100 + "%";
  //   canvas.style.maxWidth = `${settings.dimensions[0]}px`;
  //   canvas.style.maxHeight = `${settings.dimensions[1]}px`;
  // }

  // return {
  //   canvas,
  //   oglContext: gl,
  //   oglRenderer: renderer,
  //   width,
  //   height,
  //   pixelRatio,
  // };
};
