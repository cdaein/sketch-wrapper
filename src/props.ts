import { resizeCanvas } from "@daeinc/canvas";
import { prepareCanvas } from "./modes/canvas";
import { saveCanvasFrame } from "./recorders/export-frame";
import type {
  BaseProps,
  OGLProps,
  P5Props,
  SketchProps,
  SketchSettings,
  SketchSettingsInternal,
  SketchStates,
  WebGLProps,
} from "./types";
import type { OGLRenderingContext, Renderer } from "ogl-typescript";
import type p5 from "p5";

type CanvasProps = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  pixelRatio: number;
  gl: WebGLRenderingContext;
  oglContext: OGLRenderingContext;
  oglRenderer: Renderer;
  p5: p5;
};

export const createProps = async ({
  settings,
  states,
}: {
  settings: SketchSettingsInternal;
  states: SketchStates;
}) => {
  const {
    canvas,
    context,
    width,
    height,
    pixelRatio,
    gl,
    oglContext,
    oglRenderer,
    p5,
  } = (await prepareCanvas(settings)) as CanvasProps;

  // function props
  const { exportFrame, update, togglePlay } = createFunctionProps({
    canvas,
    settings,
    states,
  });

  const baseProps: BaseProps = {
    // canvas
    canvas,
    width,
    height,
    pixelRatio,
    // animation
    playhead: 0,
    frame: 0,
    time: 0,
    deltaTime: 0,
    duration: settings.duration,
    totalFrames: settings.totalFrames,
    exportFrame,
    togglePlay,
    update,
  };

  let props: SketchProps | WebGLProps | OGLProps | P5Props;

  if (settings.mode === "2d") {
    props = {
      ...baseProps,
      context: context as CanvasRenderingContext2D,
    } as SketchProps;
  } else if (settings.mode === "webgl") {
    props = {
      ...baseProps,
      gl: gl as WebGLRenderingContext,
    } as WebGLProps;
  } else if (settings.mode === "ogl") {
    props = {
      ...baseProps,
      oglContext: oglContext as OGLRenderingContext,
      oglRenderer: oglRenderer as Renderer,
    } as OGLProps;
  } else if (settings.mode === "p5") {
    props = {
      ...baseProps,
      context: context as CanvasRenderingContext2D,
      p5,
    };
  } else {
    // fallback
    props = {
      ...baseProps,
      context: context as CanvasRenderingContext2D,
    } as SketchProps;
  }

  return props;
};

const createFunctionProps = ({
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
    togglePlay: createTogglePlay({ states }),
  };
};

const createExportFrameProp = ({
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

const createTogglePlay = ({ states }: { states: SketchStates }) => {
  return () => {
    states.paused = !states.paused;
    if (states.paused) {
      // when paused
      states.pausedStartTime = states.timestamp;
    }
  };
};

// FIX: screen flicker, doesn't work when paused
const createUpdateProp = ({
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
