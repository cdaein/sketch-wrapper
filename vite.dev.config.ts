// https://vitejs.dev/guide/api-plugin.html#configureserver
// https://vitejs.dev/guide/api-plugin.html#handlehotupdate
// https://vitejs.dev/guide/api-hmr.html
// https://vitejs.dev/guide/api-plugin.html#client-server-communication

import type { ViteDevServer } from "vite";
import { defineConfig } from "vite";

const myPlugin = () => ({
  name: "configure-server",

  configureServer(server: ViteDevServer) {
    server.ws.send("wrp:greetings", { msg: "hello" });

    server.middlewares.use((rea, res, next) => {
      // custom handle request...
    });
  },

  handleHotUpdate({ server }: { server: ViteDevServer }) {
    server.ws.send({
      type: "custom",
      event: "special-update",
      data: {},
    });
    return [];
  },
});

export default defineConfig({
  // plugins: [myPlugin()],
});
