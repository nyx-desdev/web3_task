// vite.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './setupTests.ts', // Specify the setup file if you have one
    globals: true, // Enable global functions like `expect`, `test`, etc.
  },
});
