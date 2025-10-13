import { defineConfig } from "vite"
import path from "path"
import react from "@vitejs/plugin-react-swc"
import dts from "vite-plugin-dts"
import viteTsConfigPaths from "vite-tsconfig-paths"
import { fileURLToPath } from "url"
const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts({
      entryRoot: "src",
      tsConfigFilePath: path.join(__dirname, "tsconfig.json"),
      skipDiagnostics: true,
    }),
    react(),
    viteTsConfigPaths({
      root: "./",
    }),
  ],
  //  base: '/CharacterStudio/', NOTE: For Github pages, you need to add the base URL (name of the repo)
  build: {
    outDir: "./build",
  },
  resolve: {
    alias: {
      buffer: "buffer/",
    },
  },
})
