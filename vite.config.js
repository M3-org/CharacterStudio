import { defineConfig } from 'vite'
import inject from '@rollup/plugin-inject';
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    inject({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
//  base: '/CharacterStudio/', NOTE: For Github pages, you need to add the base URL (name of the repo)
  build: {
    outDir: './build',
  },
  resolve: {
    alias: {
      buffer: 'buffer/'
    }
  },
  define: {
    global: 'window',
  },
})
