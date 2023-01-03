/**
 * this config is for running demo sketch.
 * if using other build tools, you wll still need to set server headers to enable mp4 export from browser (Chrome).
 * https://github.com/amandaghassaei/canvas-capture#caveats
 */

import { defineConfig } from "vite";

export default defineConfig({
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
});
