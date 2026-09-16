import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    // Tests must never reach the network. A real browser's DOMParser does not
    // fetch a stylesheet or script it parses, but happy-dom will try, which
    // turns markup fixtures into failed requests and noisy output.
    environmentOptions: {
      happyDOM: {
        settings: {
          disableCSSFileLoading: true,
          disableJavaScriptFileLoading: true,
          disableJavaScriptEvaluation: true,
          disableIframePageLoading: true,
        },
      },
    },
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: './src/test/setup.ts',
  },
});
