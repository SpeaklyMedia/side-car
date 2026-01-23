import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Basic Vite configuration for a React + TypeScript app
// See the Side‑Car specification for build discipline and release packaging.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    port: 5173,
  }
});