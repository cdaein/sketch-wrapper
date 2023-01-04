import { resizeCanvas } from "@daeinc/canvas";
import type {
  SketchProps,
  SketchResize,
  SketchSettings,
  SketchSettingsInternal,
} from "../types";

// window resize event

export default (
  canvas: HTMLCanvasElement,
  resize: SketchResize,
  props: SketchProps,
  userSettings: SketchSettings,
  settings: SketchSettingsInternal
) => {
  const handleResize = () => {
    // keep canvas at full window size
    // only when no dimensions(fullscreen) and not for existing canvas
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
        pixelRatio: Math.max(settings.pixelRatio, 1),
        scaleContext: settings.scaleContext,
      }));
    }

    // resizing canvas style (when centered)
    // REVIEW: this should be better done with CSS rules.
    if (settings.centered) {
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

    resize(props);
  };

  const add = () => {
    window.addEventListener("resize", handleResize);
  };

  const remove = () => {
    window.removeEventListener("resize", handleResize);
  };

  return { add, remove, handleResize };
};
