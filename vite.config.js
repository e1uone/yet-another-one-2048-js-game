import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      manifest: false,
      devOptions: {
        enabled: true,
      },
    }),
  ],

  server: {
    host: "0.0.0.0",
    port: 3000,
    hmr: {
      port: 3001,
    },
  },
});
