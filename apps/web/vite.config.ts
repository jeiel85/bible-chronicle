/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Content is read straight from the repository's phase packages (docs/18 §3), which sit outside this app.
const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: { alias: { '@repo': repoRoot } },
  server: { fs: { allow: [repoRoot] } },
  // The phase content is versioned separately from the code; a separate chunk keeps code updates from
  // re-downloading it and shows its size on its own.
  build: { rollupOptions: { output: { manualChunks: id => (id.includes('/phases/') ? 'content' : undefined) } } },
  test: { environment: 'node' },
});
