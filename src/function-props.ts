import { resizeCanvas } from "@daeinc/canvas";
import { saveCanvasFrame } from "./file-exports";
import type {
  SketchProps,
  SketchSettings,
  SketchSettingsInternal,
  SketchStates,
} from "./types";

export const createFunctionProps = ({
  canvas,
  settings,
  states,
}: {
  canvas: HTMLCanvasElement;
  settings: SketchSettingsInternal;
  states: SketchStates;
}) => {
  return {
    exportFrame: createExportFrameProp({ canvas, settings, states }),
    // REVIEW: is it ok to expose internal settings like this?
    update: createUpdateProp({ canvas, prevSettings: settings, resizeCanvas }),
  };
};

export const createExportFrameProp = ({
  canvas,
  settings,
  states,
}: {
  canvas: HTMLCanvasElement;
  settings: SketchSettingsInternal;
  states: SketchStates;
}) => {
  return () => {
    states.savingFrame = true;
    states.playMode = "record";
    saveCanvasFrame({
      canvas,
      settings,
      states,
    });
  };
};

// FIX: screen flicker, doesn't work when paused
export const createUpdateProp = ({
  canvas,
  prevSettings,
  resizeCanvas,
}: {
  canvas: HTMLCanvasElement;
  prevSettings: SketchSettingsInternal;
  resizeCanvas: any;
}) => {
  return (settings: SketchSettings) => {
    console.log("update() prop is not yet implemented.");

    // if (settings.pixelRatio) {
    //   resizeCanvas({
    //     canvas,
    //     width: prevSettings.dimensions[0],
    //     height: prevSettings.dimensions[1],
    //     pixelRatio: settings.pixelRatio,
    //   });
    // }
  };
};
