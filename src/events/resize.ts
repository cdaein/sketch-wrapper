import { resizeCanvas } from "@daeinc/canvas";
import type {
  SketchProps,
  SketchSettings,
  SketchSettingsInternal,
} from "../types";

// window resize event

export default (
  canvas: HTMLCanvasElement,
  props: SketchProps,
  userSettings: SketchSettings,
  settings: SketchSettingsInternal,
  pixelRatio: number,
  scaleContext?: boolean
) => {
  const handleResize = () => {
    // only when no dimensions(fullscreen) and not existing canvas
    if (
      userSettings.dimensions === undefined &&
      userSettings.canvas === undefined
    ) {
      // REVIEW: how to handle if canvas parent is not 100% of window?
      //  1. instead of always window.innerWidth, use parent's 100%?
      //  2. if parent, don't go into fullscreen at all.
      //  3. inline-styling will override anyways...
      ({ width: props.width, height: props.height } = resizeCanvas({
        canvas,
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio,
        scaleContext,
      }));
    }
  };

  const add = () => {
    window.addEventListener("resize", handleResize);
  };

  const remove = () => {
    window.removeEventListener("resize", handleResize);
  };

  return { add, remove };
};
