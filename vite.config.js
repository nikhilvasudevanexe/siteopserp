import { defineConfig } from 'vite';

// Vanilla JS + Vite. No framework. Light bundler only, per committed stack.
export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
