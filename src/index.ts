import type {
  Sketch,
  SketchSettings,
  SketchSettingsInternal,
  SketchLoop,
  SketchRender,
  SketchResize,
  SketchWrapper,
} from "./types";
import { computeFrame, computeLastTimestamp, computePlayhead } from "./time";
import { createSettings } from "./settings";
import { createProps } from "./props";
import resizeHandler from "./events/resize";
import keydownHandler from "./events/keydown";
import { saveCanvasFrames } from "./export-frames-media-recorder";
import { createStates } from "./states";

const sketchWrapper: SketchWrapper = async (
  sketch: Sketch,
  userSettings: SketchSettings
) => {
  // const isServer = typeof module !== "undefined" && module.exports;
  // console.log(`is running on server? ${isServer ? "✅" : "❌"}`);

  // combine settings; a few may have null or undefined values (ex. canvas)
  const settings = createSettings({
    main: userSettings,
  }) as SketchSettingsInternal;

  const states = createStates({ settings });

  const props = await createProps({
    settings,
    states,
  });
  // canvas is created for props
  const { canvas } = props;

  const returned = sketch(props);

  let render: SketchRender = () => {};
  let resize: SketchResize = () => {};
  if (typeof returned === "function") {
    render = returned;
  } else {
    render = returned.render || render;
    resize = returned.resize || resize;
  }

  // animation render loop
  let recordedFrames = 0;

  const loop: SketchLoop = (timestamp: number) => {
    states.timestamp = timestamp - states.pausedDuration;

    // playing
    if (!states.savingFrames) {
      // when paused, accumulate pausedDuration
      if (states.paused) {
        states.pausedDuration = timestamp - states.pausedStartTime;
        window.requestAnimationFrame(loop);
        return;
      }

      if (states.timeResetted) {
        states.startTime = states.timestamp;
        props.time = 0;
        props.playhead = 0;
        props.frame = 0;
        states.lastTimestamp = 0;
        states.timeResetted = false;
        console.log("time resetted");
      }

      // time
      props.time = (states.timestamp - states.startTime) % props.duration;
      // deltaTime
      props.deltaTime = states.timestamp - states.lastTimestamp;
      // throttle frame rate
      if (states.frameInterval !== null) {
        if (props.deltaTime < states.frameInterval) {
          window.requestAnimationFrame(loop);
          return;
        }
      }

      // console.log(props.time / props.duration);

      computePlayhead({
        settings,
        states,
        props,
      });
      computeFrame({ settings, states, props });
      // update lastTimestamp for deltaTime calculation
      computeLastTimestamp({ states, props });

      if (settings.animate && !states.paused) {
        render(props);
        window.requestAnimationFrame(loop);
      }
    } else {
      // recording
      // reset startTime for recording
      if (!states.captureReady) {
        states.startTime = states.timestamp;
        props.time = 0;
        props.playhead = 0;
        props.frame = 0;
        console.log("reset to record");
      }

      // time
      // props.time = states.timestamp - states.startTime;

      props.time = recordedFrames * (1000 / settings.exportFps);
      // deltaTime
      props.deltaTime = 1000 / settings.exportFps;
      // throttle frame rate

      // if (
      //   states.captureReady &&
      //   !states.captureDone &&
      //   props.time < ((props.frame + 1) / props.totalFrames) * props.duration
      // ) {
      //   window.requestAnimationFrame(loop);
      //   return;
      // }

      // console.log(props.time);

      computePlayhead({
        settings,
        states,
        props,
      });
      props.frame = recordedFrames;
      computeLastTimestamp({ states, props });

      render(props);
      window.requestAnimationFrame(loop);

      recordedFrames += 1;
      // re-calculate totalFrames for exportFps
      if (
        props.frame >=
        Math.floor((settings.exportFps * settings.duration) / 1000)
      ) {
        states.captureDone = true;
        recordedFrames = 0;

        states.timeResetted = true;
      }

      // save frames
      saveCanvasFrames({ canvas, settings, states, props });
    }
  };

  if (settings.animate) window.requestAnimationFrame(loop);

  // window resize event
  const { add: addResize, handleResize } = resizeHandler(
    canvas,
    props,
    userSettings,
    settings,
    states,
    render,
    resize
  );
  // run it very first time
  handleResize();

  // keyboard events
  const { add: addKeydown } = keydownHandler(
    canvas,
    props,
    settings,
    states,
    loop
  );

  if (settings.hotkeys) {
    addResize();
    addKeydown();
  }
};

export default sketchWrapper;

export type {
  Sketch,
  SketchRender,
  SketchResize,
  SketchSettings,
  SketchProps,
  OGLProps,
  WebGLProps,
  FrameFormat,
  FramesFormat,
} from "./types";
