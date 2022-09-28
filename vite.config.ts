import { defineConfig } from "vite"
import path from "path"
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react';


// See guide on how to configure Vite at:
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts({insertTypesEntry: true})]
})
