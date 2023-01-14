import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  target: "esnext",
  dts: true,
  splitting: true,
  sourcemap: false,
  clean: true,
  treeshake: true,
  // minify: true,
  external: ["ogl-typescript", "p5"],
});
