import { defineConfig } from "vite"
import path from "path"
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react';


// See guide on how to configure Vite at:
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts({insertTypesEntry: true})],
  build: {
    assetsInlineLimit: 65536,
    lib: {
      entry: path.resolve('./src/index.ts'),
      name: 'avatarcreator',
      fileName: (format) => `avatarcreator.${format}.js`
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['react', 'react-dom'],
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
