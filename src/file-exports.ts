/**
 * REVIEW:
 * need to decide in which environment the sketch will run.
 * - dev env: run with node.js, and use ffmpeg, specify download folder (same as sketch folder)
 * - front end: run within browser, download in Downloads or saveAs dialog.
 *
 * mp4 recording:
 * - for now, I'm using canvas-capture, but I do want to try other options.
 * - browser-side mp4 export is good, but ...
 *   - the library is too big (CCapture is included, not as a dependency.)
 *   - exporting is very slow (save as webm => convert to mp4)
 *   - quality?
 */

import type { SketchStates, SketchSettingsInternal } from "./types";

/**
 * save a single frame of canvas
 *
 * TODO: support other file formats - png(default), jpg/jpeg, webp, gif
 *
 * REVIEW: to keep everything all in one function,
 * there's a bit awkward early return when initing recorder.
 * if this becomes an issue in other part of program,
 * consider separating init and recording, and place init
 * on top of draw() in index/loop()
 */
export const saveCanvasFrame = ({
  canvas,
  states,
  settings,
}: {
  canvas: HTMLCanvasElement;
  states: SketchStates;
  settings: SketchSettingsInternal;
}) => {
  let { filename, prefix, suffix, frameFormat: format } = settings;

  if (format === "jpg") format = "jpeg";
  // may add additional quality to string, but will leave at default for now
  const dataURL = canvas.toDataURL(`image/${format}`);
  const link = document.createElement("a");
  link.download = `${formatFilename({
    filename,
    prefix,
    suffix,
  })}.${format}`;
  link.href = dataURL;
  link.click();

  states.savingFrame = false;
  states.playMode = "play";
};

/**
 * format complete filename (excl. extension)
 *
 * @param param0
 * @returns
 */
export const formatFilename = ({
  filename,
  prefix = "",
  suffix = "",
}: {
  filename?: string;
  prefix?: string;
  suffix?: string;
}) => {
  return filename === undefined || filename === ""
    ? `${prefix}${formatDatetime(new Date())}${suffix}`
    : filename;
};

/**
 * get current local datetime
 *
 * @param date
 * @returns formatted string ex. "2022.12.29-14.22.34"
 */
export const formatDatetime = (date: Date) => {
  const offset = date.getTimezoneOffset();
  date.setMinutes(date.getMinutes() - offset);

  const isoString = date.toISOString();
  const [full, yyyy, mo, dd, hh, mm, ss] = isoString.match(
    /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/
  )!;

  // localeString: 12/29/2022, 2:39:37 PM
  // const str = localeString.match(
  //   /(\d{1,2})\/(\d{1,2})\/(\d{4}),\s(\d{1,2}):(\d{1,2}):(\d{1,2})\s(AM|PM)/
  // );

  const formatted = `${yyyy}.${mo}.${dd}-${hh}.${mm}.${ss}`;

  return formatted;
};
