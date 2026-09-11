import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages serves the site from /strable/; dev and preview use the same path.
  base: '/strable/',
  build: {
    rollupOptions: {
      input: { main: 'index.html', styleguide: 'styleguide.html' },
    },
  },
});
