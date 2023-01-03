import { describe, expect, test } from "@jest/globals";
import "jest-canvas-mock";
import { sketchWrapper } from "../src";
import { Sketch, SketchSettings } from "../src/types";

// const sketch: Sketch = () => {
//   return () => {
//     console.log("sketch");
//   };
// };

// describe("sketchWrapper()", () => {
//   test("test", () => {
//     const settings: SketchSettings = {
//       duration: 1000,
//       totalFrames: 120,
//     };
//     expect(sketchWrapper(sketch, settings)).toThrow();
//   });
// });
