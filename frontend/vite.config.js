import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: ".",
  appType: "spa",
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
