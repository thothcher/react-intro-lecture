import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` produces dist/index.html with every script, style, font and image inlined,
// so the deck opens by double-click (file://) with no server and no internet.
// React is a real dependency: the "vanilla vs React" demos run actual React next to actual DOM code.
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: { assetsInlineLimit: 100_000_000, chunkSizeWarningLimit: 4000 },
  server: { port: 5180 },
});
