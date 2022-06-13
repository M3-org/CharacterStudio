import { defineConfig } from "vite"
import reactRefresh from "@vitejs/plugin-react-refresh"
import path from "path"
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react';


// See guide on how to configure Vite at:
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), reactRefresh(), dts({insertTypesEntry: true})],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'dist/src/index.js'),
      name: 'avatar-creator',
      fileName: (format) => `avatar-creator.${format}.js`
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['react'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: 'React'
        }
      }
    }
  }
})
