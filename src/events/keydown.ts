import type {
  OGLProps,
  SketchLoop,
  SketchProps,
  SketchSettingsInternal,
  SketchStates,
  WebGLProps,
} from "../types";

export default (
  canvas: HTMLCanvasElement,
  props: SketchProps | OGLProps | WebGLProps,
  settings: SketchSettingsInternal,
  states: SketchStates,
  loop: SketchLoop
) => {
  const handleKeydown = (ev: KeyboardEvent) => {
    if (ev.key === " ") {
      ev.preventDefault();
      props.togglePlay();
    } else if ((ev.metaKey || ev.ctrlKey) && !ev.shiftKey && ev.key === "s") {
      ev.preventDefault();
      // save frame (still)
      props.exportFrame();
    } else if ((ev.metaKey || ev.ctrlKey) && ev.shiftKey && ev.key === "s") {
      ev.preventDefault();
      // save frames (video)
      if (!states.savingFrames) {
        states.savingFrames = true;
      } else {
        states.captureDone = true;
      }
    }
  };

  const add = () => {
    window.addEventListener("keydown", handleKeydown);
  };

  const remove = () => {
    window.removeEventListener("keydown", handleKeydown);
  };

  return { add, remove };
};
