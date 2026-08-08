import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";
import { resolve } from "node:path";

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        "@": resolve(process.cwd(), "src"),
      },
    },
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "icon-192.png", "icon-512.png"],
        manifest: {
          name: "Fintrail",
          short_name: "Fintrail",
          description: "A student-first personal finance dashboard for tracking spending, goals, and group expenses.",
          start_url: "/",
          display: "standalone",
          background_color: "#0f172a",
          theme_color: "#2563eb",
          icons: [
            {
              src: "/icon-192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/icon-512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,webmanifest}"]
        },
      }),
    ],
  },
  tanstackStart: {
    srcDirectory: "src",
    server: { entry: "server" },
  },
});
