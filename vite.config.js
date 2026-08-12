import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Relative base so `dist/` can be opened from a file share, a subdirectory,
  // or any static host without rebuilding — same as the dining reference.
  base: './',
  build: { outDir: 'dist/web', emptyOutDir: true },
});
