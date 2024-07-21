import react from "@vitejs/plugin-react";
import path from "path";
import { rimraf } from "rimraf";
import { defineConfig } from "vite";

function removeMSW() {
  return {
    name: "remove-msw",
    closeBundle: async () => {
      await rimraf(path.join(__dirname, "dist", "mockServiceWorker.js"));
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), removeMSW()],
});
