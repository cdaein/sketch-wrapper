import type {
  SketchLoop,
  SketchProps,
  SketchSettingsInternal,
  SketchStates,
} from "../types";

export default (
  canvas: HTMLCanvasElement,
  loop: SketchLoop,
  props: SketchProps,
  settings: SketchSettingsInternal,
  states: SketchStates
) => {
  const handleKeydown = (ev: KeyboardEvent) => {
    if (ev.key === " ") {
      ev.preventDefault();
      console.log("sketch paused or resumed");
      states.isAnimating = !states.isAnimating;
      // FIX: time has advanced when resumed
      if (states.isAnimating) window.requestAnimationFrame(loop);
    } else if ((ev.metaKey || ev.ctrlKey) && !ev.shiftKey && ev.key === "s") {
      // save frame (still)
      ev.preventDefault();
      states.savingFrame = true;
      states.playMode = "record";
    } else if ((ev.metaKey || ev.ctrlKey) && ev.shiftKey && ev.key === "s") {
      // save frames (video)
      ev.preventDefault();
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
