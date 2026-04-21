import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: 'assets/src',
  build: {
    outDir: path.resolve(__dirname, '.tmp/public'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      components: path.resolve(__dirname, 'assets/src'),
    },
  },
  plugins: [
    react(),
    compression({ algorithm: 'gzip', exclude: /\.(gz|br)$/i }),
  ],
  server: {
    port: 9000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:1337',
        changeOrigin: true,
      },
    },
  },
});
