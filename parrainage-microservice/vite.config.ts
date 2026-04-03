import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@parrainage': path.resolve(__dirname, 'src/modules/parrainage'),
    },
  },
  server: {
    port: 3002,
    host: '0.0.0.0',
  },
  preview: {
    port: 3002,
    host: '0.0.0.0',
  },
});

