/**
 * time keeping
 */

import {
  SketchProps,
  SketchSettings,
  SketchSettingsInternal,
  SketchStates,
} from "./types";

/**
 *  REVIEW: props.deltaTime is 0 at start. to calculate a value, set it BEFORE draw(props) in loop(), but for now, this will do.
 *
 * @param param0
 */
export const advanceTime = ({
  props,
  settings,
  states,
}: {
  props: SketchProps;
  settings: SketchSettingsInternal;
  states: SketchStates;
}) => {
  const { playFps, exportFps, duration, totalFrames } = settings;
  const fps = states.savingFrames ? exportFps : playFps;

  // call performance.now() once and re-use.
  // avoid having slight difference between calls.
  states.timestamp = performance.now();

  // REVIEW: set inital value to null, instead of 0?
  if (states.startTime === 0) {
    states.startTime = states.timestamp;
    states.lastTimestamp = states.timestamp;
  }

  props.deltaTime = states.timestamp - states.lastTimestamp;
  props.time = states.timestamp - states.startTime;
  // props.playhead = props.playhead + props.deltaTime / duration
  props.playhead = duration !== Infinity ? props.time / duration : 0;
  computeFrame({ settings, props });
};

const computeFrame = ({
  settings,
  props,
}: {
  settings: SketchSettingsInternal;
  props: SketchProps;
}) => {
  const { duration, playFps, totalFrames } = settings;

  // 4 cases
  if (duration !== Infinity) {
    if (playFps !== null) {
      props.frame = Math.floor(props.playhead * totalFrames);
    } else {
      props.frame += 1;
    }
  } else {
    if (playFps !== null) {
      props.frame = Math.floor((props.time * playFps) / 1000);
    } else {
      props.frame += 1;
    }
  }
};

export const advanceFrame = (settings: SketchSettings) => {
  // when recording (ie. gif), we only want to record a new frame, not duplicte in case of high refresh rate (exportFps !== playFps)
};

//==================================================
// below is copied from index.ts
// two other ideas i explored for time keeping. leaving them here for reference just in case.

// animation loop (2nd method)
// {
//   let startTimeInMillis: number | undefined;
//   let previousTimeInMillis = 0;

//   let lastTime = 0;
//   let elapsedTimeInMillis = 0;

//   const loop = (timestamp: number) => {
//     if (startTimeInMillis === undefined) {
//       startTimeInMillis = timestamp;
//     }
//     // compute time
//     elapsedTimeInMillis = timestamp - startTimeInMillis;
//     props.playhead = props.duration
//       ? elapsedTimeInMillis / durationInMillis
//       : 0;
//     props.time = elapsedTimeInMillis;
//     props.deltaTime = elapsedTimeInMillis - previousTimeInMillis;
//     props.frame = props.duration
//       ? Math.floor(props.playhead * totalFrames)
//       : Math.floor(props.time * exportFps);

//     // const currentTime = timestamp;
//     // const deltaTime = currentTime - lastTime;
//     // console.log({ deltaTime });
//     // lastTime = currentTime;

//     // console.log(props.deltaTime);

//     // update time
//     previousTimeInMillis = elapsedTimeInMillis;

//     // if (props.frame >= totalFrames) {
//     if (props.playhead >= 1) {
//       startTimeInMillis = timestamp;
//       props.playhead = 0;
//       // props.time = 0;
//     } else {
//       draw(props);
//     }

//     // console.log(props.playhead);

//     window.requestAnimationFrame(loop);
//   };
//   // window.requestAnimationFrame(loop);
// }

// // animation loop
// {
//   let startTimeInMillis = performance.now();
//   let previousTimeInMillis = startTimeInMillis;

//   const loop = (timestamp: number) => {
//     // draw(props);

//     // time management
//     // REVIEW
//     const elapsedTimeInMillis = performance.now() - startTimeInMillis;

//     // FIX: goes slightly over 1
//     //      one solution is Math.min(val, 1)
//     props.playhead = props.duration
//       ? elapsedTimeInMillis / durationInMillis
//       : 0;
//     // FIX: goes over duration
//     props.time = elapsedTimeInMillis;
//     props.deltaTime = elapsedTimeInMillis - previousTimeInMillis;
//     props.frame = props.duration
//       ? Math.floor(props.playhead * totalFrames)
//       : Math.floor(props.time * exportFps);

//     // update time
//     previousTimeInMillis = elapsedTimeInMillis;
//     if (props.playhead >= 1) {
//       startTimeInMillis = performance.now();
//     } else {
//       draw(props);
//     }
//   };
//   // loop(startTimeInMillis);
// }
