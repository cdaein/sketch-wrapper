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
      // if (process.env.NODE_ENV === "development")
      // console.log("sketch paused or resumed");
      props.togglePlay();
      // states.paused = !states.paused;
      // if (!states.paused) {
      //   // when resumed: call loop so animation will continue
      //   window.requestAnimationFrame(loop);
      // } else {
      //   // when paused
      //   states.pausedStartTime = states.timestamp;
      // }
    } else if ((ev.metaKey || ev.ctrlKey) && !ev.shiftKey && ev.key === "s") {
      // save frame (still)
      ev.preventDefault();
      props.exportFrame();
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
