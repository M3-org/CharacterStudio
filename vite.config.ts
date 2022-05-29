import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  mode: "development",
  resolve: {
    alias: {
      _: path.resolve(__dirname, "src"),
    },
  },
  plugins: [reactRefresh()],
  clearScreen: false,
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3001,
      protocol: "ws",
    },
  },
});
