import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import * as path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '../'), '');

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: Number(env.VITE_PORT),
      host: true,
      fs: {
        strict: false,
      },
    },
    build: {
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html'),
      },
    },
  };
});
