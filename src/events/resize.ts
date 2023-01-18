import { resizeCanvas } from "@daeinc/canvas";
import type {
  OGLProps,
  P5Props,
  SketchProps,
  SketchRender,
  SketchResize,
  SketchSettings,
  SketchSettingsInternal,
  SketchStates,
  WebGLProps,
} from "../types";

// window resize event
// REVIEW: do i need to separate window resize and canvas resize?
// canvas style change: window resize
// resize() return: canvas resize
export default (
  canvas: HTMLCanvasElement,
  props: SketchProps | OGLProps | WebGLProps | P5Props,
  userSettings: SketchSettings,
  settings: SketchSettingsInternal,
  render: SketchRender,
  resize: SketchResize
) => {
  const handleResize = () => {
    // keep canvas at full window size
    // when fullscreen & new canvas
    if (
      userSettings.dimensions === undefined &&
      userSettings.canvas === undefined
    ) {
      // REVIEW: how to handle if canvas parent is not 100% of window?
      //  1. instead of always window.innerWidth, use parent's 100%?
      //  2. if parent, don't go into fullscreen at all.
      //  3. inline-styling will override anyways...

      if (settings.mode === "2d" || settings.mode === "webgl") {
        ({ width: props.width, height: props.height } = resizeCanvas({
          canvas,
          mode: settings.mode,
          width: window.innerWidth,
          height: window.innerHeight,
          pixelRatio: Math.max(settings.pixelRatio, 1),
          scaleContext: settings.scaleContext,
        }));
      }
      // call only when canvas size has changed (ie. fullscreen)
      resize(props);
    }

    render(props);

    // resizing canvas style (when !fullscreen & centered)
    // REVIEW: this should be better done with CSS rules.
    if (userSettings.dimensions !== undefined && settings.centered) {
      const margin = 50; // px // TODO: add to settings
      const canvasParent = canvas.parentElement!;
      const parentWidth = canvasParent.clientWidth;
      const parentHeight = canvasParent.clientHeight;
      const scale = Math.min(
        1,
        Math.min(
          (parentWidth - margin * 2) / props.width,
          (parentHeight - margin * 2) / props.height
        )
      );
      canvas.style.transform = `scale(${scale})`;
    }
  };

  const add = () => {
    window.addEventListener("resize", handleResize);
  };

  const remove = () => {
    window.removeEventListener("resize", handleResize);
  };

  return { add, remove, handleResize };
};
