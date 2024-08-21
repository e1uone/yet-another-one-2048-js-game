import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
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
