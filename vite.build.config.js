// for library build

import { resolve } from "path";
import { defineConfig } from "vite";
// import dts from "rollup-plugin-dts";
import dts from "vite-plugin-dts";
// import ts from "vite-plugin-typescript";

export default defineConfig({
  build: {
    emptyOutdir: true,
    ourDir: "dist",
    target: "esnext",
    lib: {
      name: "@daeinc/sketch-wrapper",
      fileName: "index",
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      external: ["@daeinc/dom", "@daeinc/canvas", "p5"],
      // plugins: [dts()],
    },
  },
  // plugins: [dts()],
});
