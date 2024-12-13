import { defineConfig } from "vite";
import { ghPages } from "vite-plugin-gh-pages";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/jodoappjodo/",
  plugins: [react(), ghPages()],
  server: { port: 3000 },
  build: {
    rollupOptions: {
      external: ["./bootstrap/dist/css/bootstrap.min.css"],
    },
  },
});
