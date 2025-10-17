/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  root: ".",
  appType: "spa",
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@api": path.resolve(__dirname, "./src/api"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: './src/setupTests.js',
  },
});
