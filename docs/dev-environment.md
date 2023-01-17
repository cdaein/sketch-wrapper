# Local Development Environment

## Dynamic import

Sketch Wrapper uses dynamic import of optional dependencies (ex. `ogl-typescript`) to reduce the package size. Your bundler may try to pre-bundle and complain that it cannot find these dependencies. To get around this, you will need to exclude them at bundle time. [Vitejs](https://vitejs.dev/) is recommended to use with Sketch Wrapper and you can use [`optimizeDeps.exclude`](https://vitejs.dev/guide/dep-pre-bundling.html). Likewise, it will also complain when you try to build the project. You can use `build.rollupOptions.external` to exclude it as well. This is not an ideal situation, and I will need to find a better and seamless way in the future.

```js
// vite.config.js
export default defineConfig({
  optimizeDeps: {
    exclude: ["ogl-typescript"],
  },
  build: {
    rollupOptions: {
      external: ["ogl-typescript"],
    },
  },
});
```

## To dos

- how to run without bundler
- how to use with vite
- how to use with parcel
