import { SketchSettings, SketchSettingsInternal } from "./types";

/**
 * combine settings. use base object (defaultSettings) as starting point and override with main object (userSettings).
 * if any value from main object is undefined, use base object value instead.
 * null values may pass through.
 *
 * @param param0
 * @returns
 */
export const combineSettings = ({
  main,
}: {
  // REVIEW: or NonNullable<SketchSettings>
  main: Exclude<SketchSettings, undefined>;
}) => {
  // data flow: userSettings + defaultSettings => settings => states (mutable) => props => sketch()
  // default settings
  // TODO: create settings.ts
  const defaultSettings: SketchSettingsInternal = {
    // document
    title: "Sketch",
    background: "#333",
    // canvas
    parent: "body",
    canvas: null,
    dimensions: [window.innerWidth, window.innerHeight],
    pixelRatio: 1,
    centered: true,
    scaleContext: true,
    pixelated: false,
    // animation
    animate: true,
    playFps: null,
    exportFps: 60,
    duration: Infinity,
    totalFrames: Infinity,
    // file
    filename: "",
    prefix: "",
    suffix: "",
    frameFormat: "png",
    framesFormat: "webm",
    // sketch
    hotkeys: true,
    mode: "2d",
  };

  const combined = Object.assign({}, defaultSettings, main);
  // if main has undefined value, use value from base
  for (const [key, value] of Object.entries(combined)) {
    if (value === undefined) {
      // FIX: i'm out of ideas on how to fix this TS error.
      //      i'm pretty sure it works as intended w/o type check.
      //      adding [key:string]:any to SketchSettings type will solve it,
      //      but it will disable safety check
      //      when user provided non-existing key to settings object.
      //@ts-ignore
      combined[key] = defaultSettings[key as keyof SketchSettings];
    }
  }
  if (Object.values(combined).some((value) => value === undefined)) {
    throw new Error("settings object cannot have undefined values");
  }
  return combined;
};
