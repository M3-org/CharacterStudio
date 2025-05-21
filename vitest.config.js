import { defineConfig } from 'vitest/config'
// import react from '@vitejs/plugin-react-swc' // Temporarily remove for debugging

export default defineConfig({
  // plugins: [react()], // Temporarily remove for debugging
  test: {
    globals: true,
    environment: 'jsdom',
    // setupFiles: './vitest.setup.js', // Temporarily remove for debugging
    include: ['src/**/*.test.js', 'src/**/*.test.jsx'],
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'public/**',
      'coverage/**',
      '.git/**',
      '.github/**',
      '.vscode/**',
    ],
  },
})
