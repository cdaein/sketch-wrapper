import { setupCanvas } from '@daeinc/canvas';

// src/modes/ogl.ts
var createOglCanvas = async (settings) => {
  let [width, height] = settings.dimensions;
  let pixelRatio = Math.max(settings.pixelRatio, 1);
  const attributes = settings.attributes;
  try {
    const Renderer = (await import('ogl-typescript')).Renderer;
    const renderer = new Renderer({
      width,
      height,
      dpr: settings.pixelRatio,
      ...attributes
    });
    const gl = renderer.gl;
    let canvas = gl.canvas;
    ({ canvas, width, height, pixelRatio } = setupCanvas({
      parent: settings.parent,
      canvas,
      width,
      height,
      pixelRatio
    }));
    if (settings.centered === true) {
      const canvasContainer = canvas.parentElement;
      canvasContainer.style.width = "100vw";
      canvasContainer.style.height = "100vh";
      canvasContainer.style.display = "flex";
      canvasContainer.style.justifyContent = "center";
      canvasContainer.style.alignItems = "center";
      if (settings.scaleContext === false) {
      }
    } else {
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
      pixelRatio
    };
  } catch (e) {
  }
};

export { createOglCanvas };
