import { describe, expect, test } from "@jest/globals";
import { combineSettings } from "../src/helpers";
import { SketchSettings } from "../src/types";

const defaultSettings: SketchSettings = {
  // document
  title: "Sketch",
  background: "#333",
  // canvas
  dimensions: [window.innerWidth, window.innerHeight],
  pixelRatio: 1,
  centered: true,
  scaleContext: true,
  pixelated: false,
  // animation
  animate: true,
  playFps: 60,
  exportFps: 60,
  duration: Infinity,
  totalFrames: Infinity,
  // file
  filename: "",
  prefix: "",
  suffix: "",
  frameFormat: "png",
  framesFormat: "mp4",
};

describe("combineSettings()", () => {
  test("handles userSettings with wrong key", () => {
    // wrong key included
    const userSettings3: SketchSettings = {
      dimension: [800, 400],
      center: true,
    };
    const settings = combineSettings({
      base: defaultSettings,
      main: userSettings3,
    });

    // TODO
  });

  test("uses defaultSettings when userSettings is empty", () => {
    // empty
    const userSettings1: SketchSettings = {
      //
    };

    const settings = combineSettings({
      base: defaultSettings,
      main: userSettings1,
    });

    expect(settings.title).toEqual(defaultSettings.title);
    expect(settings.background).toEqual(defaultSettings.background);
    expect(settings.dimensions).toStrictEqual([
      window.innerWidth,
      window.innerHeight,
    ]);
    expect(settings.pixelRatio).toEqual(defaultSettings.pixelRatio);
    expect(settings.centered).toEqual(defaultSettings.centered);
    expect(settings.scaleContext).toEqual(defaultSettings.scaleContext);
    expect(settings.pixelated).toEqual(defaultSettings.pixelated);
    expect(settings.animate).toEqual(defaultSettings.animate);
    expect(settings.playFps).toEqual(defaultSettings.playFps);
    expect(settings.exportFps).toEqual(defaultSettings.exportFps);
    expect(settings.duration).toEqual(defaultSettings.duration);
    expect(settings.totalFrames).toEqual(defaultSettings.totalFrames);
    expect(settings.filename).toEqual(defaultSettings.filename);
    expect(settings.prefix).toEqual(defaultSettings.prefix);
    expect(settings.suffix).toEqual(defaultSettings.suffix);
    expect(settings.frameFormat).toEqual(defaultSettings.frameFormat);
    expect(settings.framesFormat).toEqual(defaultSettings.framesFormat);
  });

  test("combines incomplete userSettings", () => {
    // partial
    const userSettings2: SketchSettings = {
      dimensions: [800, 400],
      filename: "My Sketch",
      animate: true,
      exportFps: 25,
    };
    const settings = combineSettings({
      base: defaultSettings,
      main: userSettings2,
    });

    // coming from userSettings2
    expect(settings.dimensions).toStrictEqual([800, 400]);
    expect(settings.filename).toBe("My Sketch");
    expect(settings.animate).toBe(true);
    expect(settings.exportFps).toBe(25);
    // coming from defaultSettings
    expect(settings.background).toBe("#333");
    expect(settings.duration).toBe(Infinity);
  });
});
