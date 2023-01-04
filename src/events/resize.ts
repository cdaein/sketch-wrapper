import { resizeCanvas } from "@daeinc/canvas";
import type {
  SketchLoop,
  SketchProps,
  SketchRender,
  SketchResize,
  SketchSettings,
  SketchSettingsInternal,
} from "../types";

// window resize event

export default (
  canvas: HTMLCanvasElement,
  props: SketchProps,
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

      // REVIEW: not sure about updating props here. props should be read-only.

      ({ width: props.width, height: props.height } = resizeCanvas({
        canvas,
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: Math.max(settings.pixelRatio, 1),
        scaleContext: settings.scaleContext,
      }));

      // console.log("resize");
    }

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

    resize(props);
    render(props); // this helps with canvas flicker while resizing
  };

  const add = () => {
    window.addEventListener("resize", handleResize);
  };

  const remove = () => {
    window.removeEventListener("resize", handleResize);
  };

  return { add, remove, handleResize };
};
