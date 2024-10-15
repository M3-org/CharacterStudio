import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
//  base: '/CharacterStudio/', NOTE: For Github pages, you need to add the base URL (name of the repo)
  build: {
    outDir: './build',
  }
})
